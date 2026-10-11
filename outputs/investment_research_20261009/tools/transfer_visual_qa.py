"""Reuse original-page visual reviews only when the PNG bytes match exactly.

This does not inspect images. It verifies original-review provenance, verifies
the current image hashes, and lists every target page still requiring a view.
"""
import argparse
import datetime
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def sha256(file):
    return hashlib.sha256(Path(file).read_bytes()).hexdigest()


def page_ranges(pages):
    """Compact a sorted page list without dropping any pages."""
    pages = sorted(set(pages))
    ranges = []
    start = previous = None
    for page in pages:
        if previous is not None and page != previous + 1:
            ranges.append(str(start) if start == previous else f'{start}-{previous}')
            start = None
        if start is None:
            start = page
        previous = page
    if start is not None:
        ranges.append(str(start) if start == previous else f'{start}-{previous}')
    return ','.join(ranges)


def original_sources(logs):
    """Index verified original reviews by hash; any issue vetoes that hash."""
    sources, rejected, issues = {}, [], set()
    file_hashes = {}
    for log_path, data in logs:
        for record in data.get('records', []):
            if record.get('openedAtOriginalResolution') is not True:
                continue
            digest = record.get('sha256', '')
            source = Path(record.get('path', ''))
            if not re.fullmatch(r'[a-fA-F0-9]{64}', digest):
                rejected.append({'log': str(log_path), 'reason': 'missing valid recorded SHA256', 'record': record})
                continue
            try:
                actual = file_hashes.setdefault(str(source), None)
                if actual is None:
                    actual = file_hashes[str(source)] = sha256(source)
            except (OSError, ValueError) as error:
                rejected.append({'log': str(log_path), 'path': str(source), 'reason': str(error)})
                continue
            if actual != digest:
                rejected.append({'log': str(log_path), 'path': str(source), 'reason': 'source bytes changed after original review'})
                continue
            if record.get('result') == 'issue':
                issues.add(digest)
                continue
            if record.get('result') != 'pass':
                continue
            evidence = {
                'log': str(log_path), 'reviewer': data.get('reviewer', 'unknown'),
                'tag': record.get('tag'), 'fingerprint': record.get('fingerprint'),
                'volume': record.get('volume'), 'page': record.get('page'),
                'path': str(source), 'sha256': digest,
                'openedAtOriginalResolution': True,
                'recordedAt': record.get('recordedAt'), 'note': record.get('note', '')
            }
            bucket = sources.setdefault(digest, [])
            identity = (evidence['path'], evidence['reviewer'], evidence['tag'])
            if not any((e['path'], e['reviewer'], e['tag']) == identity for e in bucket):
                bucket.append(evidence)
    for digest in issues:
        sources.pop(digest, None)
    return sources, rejected, issues


def audit_target(manifest, sources, issues, target_tag):
    records, pending, summaries = [], [], []
    for volume in sorted(manifest['records'], key=lambda v: v['index']):
        assert volume['status'] == 'rendered', 'Target volume has not rendered'
        images = volume['pageImages']
        assert len(images) == volume['pages'], 'Target image count differs from PDF pages'
        assert sorted(p['page'] for p in images) == list(range(1, volume['pages'] + 1)), 'Target page numbers are incomplete or duplicated'
        missing, direct_count, inherited_count = [], 0, 0
        for image in images:
            digest = sha256(image['path'])
            assert digest == image['sha256'], 'Target PNG differs from render manifest: ' + image['path']
            evidence = sources.get(digest, [])
            direct = [s for s in evidence if s['tag'] == target_tag and s['path'] == image['path']]
            method = 'direct_original_review' if direct else 'exact_sha256_transfer'
            if evidence:
                direct_count += bool(direct)
                inherited_count += not bool(direct)
                records.append({
                    'tag': target_tag, 'fingerprint': manifest['fingerprint'],
                    'volume': volume['index'], 'page': image['page'],
                    'path': image['path'], 'sha256': digest, 'result': 'pass',
                    'verificationMethod': method,
                    'openedAtOriginalResolution': bool(direct),
                    'originalReviews': evidence,
                    'note': 'PNG bytes equal a verified original-resolution review; no perceptual comparison used.'
                })
            else:
                missing.append(image['page'])
                pending.append({
                    'volume': volume['index'], 'page': image['page'],
                    'path': image['path'], 'sha256': digest,
                    'reason': 'A verified original review reports an issue' if digest in issues else 'No verified original-resolution review with identical SHA256'
                })
        summaries.append({
            'volume': volume['index'], 'pages': volume['pages'],
            'directOriginalPages': direct_count, 'exactHashTransferredPages': inherited_count,
            'coveredPages': direct_count + inherited_count, 'pendingPages': len(missing),
            'pendingPageRanges': page_ranges(missing),
            'coveragePercent': round(100 * (direct_count + inherited_count) / volume['pages'], 4)
        })
    return records, pending, summaries


def self_test():
    import tempfile
    with tempfile.TemporaryDirectory(prefix='research_visual_transfer_test_') as directory:
        test_file = Path(directory) / 'page.png'
        test_file.write_bytes(b'exact image bytes')
        digest = sha256(test_file)
        record = {'path': str(test_file), 'sha256': digest, 'result': 'pass', 'openedAtOriginalResolution': True, 'tag': 'old', 'volume': 1, 'page': 1}
        log = Path(directory) / 'log.json'
        sources, rejected, issues = original_sources([(log, {'reviewer': 'a', 'records': [record, record]})])
        assert len(sources[digest]) == 1 and not rejected and not issues
        manifest = {'fingerprint': 'test', 'records': [{'index': 1, 'status': 'rendered', 'pages': 1, 'pageImages': [{'page': 1, 'path': str(test_file), 'sha256': digest}]}]}
        result, pending, _ = audit_target(manifest, sources, issues, 'new')
        assert len(result) == 1 and not pending and result[0]['verificationMethod'] == 'exact_sha256_transfer' and result[0]['openedAtOriginalResolution'] is False
        sources, rejected, issues = original_sources([(log, {'records': [record, {**record, 'result': 'issue'}]})])
        assert digest not in sources and digest in issues
        sources, _, _ = original_sources([(log, {'records': [{**record, 'openedAtOriginalResolution': False}]})])
        assert not sources
        test_file.write_bytes(b'changed image bytes')
        sources, rejected, _ = original_sources([(log, {'records': [record]})])
        assert not sources and len(rejected) == 1
        assert page_ranges([1, 2, 4, 6, 7, 8]) == '1-2,4,6-8'
    print(json.dumps({'selfTest': 'passed', 'checks': 6}))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--from-tag', action='append', default=[], help='One or more tags with original review logs')
    parser.add_argument('--to-tag', help='Target render manifest tag')
    parser.add_argument('--output', help='Optional JSON output path; defaults to qa/visual_transfer_<tag>.json')
    parser.add_argument('--expected-volumes', type=int, default=13, help='Required rendered volume count; full stock delivery has 13')
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    assert args.to_tag and re.fullmatch(r'[a-zA-Z0-9_]+', args.to_tag), 'A simple target tag is required'
    tags = list(dict.fromkeys(args.from_tag + [args.to_tag]))
    assert all(re.fullmatch(r'[a-zA-Z0-9_]+', tag) for tag in tags), 'Tags must be simple identifiers'
    logs = []
    for tag in tags:
        for file in sorted((ROOT / 'qa').glob(f'visual_review_{tag}_*.json')):
            logs.append((file, json.loads(file.read_text(encoding='utf-8'))))
    sources, rejected, issues = original_sources(logs)
    manifest_path = ROOT / 'qa' / f'report_render_manifest_{args.to_tag}.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    assert args.expected_volumes > 0, 'Expected volume count must be positive'
    rendered_indexes = sorted(v['index'] for v in manifest['records'])
    render_coverage_complete = rendered_indexes == list(range(args.expected_volumes))
    records, pending, summaries = audit_target(manifest, sources, issues, args.to_tag)
    result = {
        'tag': args.to_tag, 'fingerprint': manifest['fingerprint'],
        'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'method': 'Only byte-identical PNG SHA256 from actual original-resolution pass reviews; issue hashes veto reuse; every target page recorded once.',
        'sourceTags': tags, 'sourceLogs': [str(file) for file, _ in logs],
        'targetManifest': str(manifest_path),
        'pages': len(records) + len(pending), 'coveredPages': len(records),
        'pendingPages': len(pending), 'expectedVolumes': args.expected_volumes,
        'renderedVolumes': len(rendered_indexes), 'renderCoverageComplete': render_coverage_complete,
        'missingVolumes': sorted(set(range(args.expected_volumes)) - set(rendered_indexes)),
        'allPagesReviewed': not pending and render_coverage_complete,
        'passed': not pending and render_coverage_complete, 'sourceRecordsRejected': rejected,
        'summaries': summaries, 'records': records, 'pending': pending
    }
    output = Path(args.output).resolve() if args.output else ROOT / 'qa' / f'visual_transfer_{args.to_tag}.json'
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: result[k] for k in ['tag', 'fingerprint', 'pages', 'coveredPages', 'pendingPages', 'allPagesReviewed']} | {'output': str(output), 'rejectedSourceRecords': len(rejected), 'volumes': summaries}, ensure_ascii=False))


if __name__ == '__main__':
    main()
