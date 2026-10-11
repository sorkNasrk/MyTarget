# Workbook layout release handoff

Final saved candidate: `preserved_final_notes.xlsx`.

SHA256: `53fb8440b9b90ec0be1d536c7df6400e44f2e0f0589012bd6f082be58e2c40b3`.

Original deliverable is unchanged. Its SHA256 remains `75aa327add9be62355521d666f17361b3bfa375b8e7d2e51508a45112a69a2de`.

`preserved_final_notes_integrity.json` confirms no added/removed native parts or semantic changes; only authorized columns, targeted cell styles, and row heights changed on 19 sheets. Original formula text, caches, source values, validations, tables, names, and native package parts are preserved.

`final_render_manifest.json` contains 59 saved-candidate ranges. Core 45 were rerendered from `preserved_release.xlsx`; candidate-to-candidate edits subsequently affect only the six added native note sheets, whose 14 ranges were rendered from their respective saved final candidate. All other sheet XML is exact unchanged between these candidate stages. Valid visual evidence is checked by exact PNG SHA256 in `final_visual_layout.json`, `final_visual_delegated.json`, and `final_visual_release.json`.

57 of 59 ranges have actual original-resolution pass evidence. Pending actual visual review:

- `final_renders/亚盛年度经营桥_2.png`, range `K6:T13`.
- `final_renders/亚盛年度经营桥_3.png`, range `U6:AD13`.

This agent reached exactly 40 original images (including before repair), so did not open or infer passes for these remaining two.

Repair scope includes core 13 sheets, plus 诺诚风险收入桥 M, 诺诚估值桥 S, 云顶风险收入桥 M, 亚盛风险收入桥 M, 映恩风险收入桥 M, 亚盛年度经营桥 AS. The repeated risk-revenue rights paragraphs are now widened and wrapped with row height 48; finite/no-terminal/annual notes are widened and wrapped. All repaired rows in the visible saved sample passed actual review except the two pending numeric segments above.

wb07 view280 (映恩风险收入桥 M7:M14) is a confirmed issue in the original workbook render. It has already been repaired in this saved candidate and actually reviewed: `final_renders/映恩风险收入桥_2.png` in `final_visual_release.json` shows full “self-sale net before ownRD; margin includes ThreeSBio selling and manufacturing budget, not free gross sales”. Do not duplicate this edit unless new evidence shows a different issue.

Main `qa/workbook_render_manifest_63ca87a2011995a6.json` still has 559 original indices; no integration applied. `tools/integrate_core_layout_qa.py` dry-run writes `layout_integration.json` and preserves indices, replaces matching/split affected views, and appends new split ranges. Expected result is 570 total views, 233 sheets. It refuses `--apply` while any candidate view lacks exact-SHA actual original pass evidence.

Remaining release actions for root:

1. Actually open two pending ranges and record with `record_core_layout_qa.py` using a fresh reviewer.
2. Complete any further genuine layout fixes discovered in remaining workbook QA; keep original source guarded and audit final candidate.
3. Apply integration only after all saved candidate ranges have pass evidence. Keep old issue records as evidence of old PNG hashes; never relabel old images pass.
4. Guard original deliverable SHA256 above, preserve a backup, install only exact audited final candidate, then rerun `workbook_qa.py`, `crossformat_qa.py`, and `workbook_visual_gate.py`. Main manifest and deliverable were not overwritten by this agent.
