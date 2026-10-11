# Native layout final candidate handoff

Saved candidate: `preserved_native_final.xlsx`.

Final SHA256: `78c04246a73bae62319094d249424deb0814afd8dc967ff791a742d027ab43b0`.

Original deliverable is untouched, SHA256 `75aa327add9be62355521d666f17361b3bfa375b8e7d2e51508a45112a69a2de`.

`preserved_native_final_integrity.json` passes: no added/removed package parts; no non-authorized semantic changes. Original formulas, cached values, source values and source line breaks, native tables/names/validations and all original native parts are retained. Original styles are append-only, and this stage overlays authored alignment onto each original cell style while retaining its font/fill/border/number format. Twenty-five sheets differ from the original; every sheet's original/current XML SHA256 is recorded in the audit.

New repairs are 映恩年度经营桥 AS (42 wide, wrapped, at least 30 body-row height), 再鼎年度经营桥 AP (50 wide, wrapped, at least 30), 财务原值 F/G/J (52/66/110 wide, wrapped and fitted body rows preserving existing height minimum), 金山经营及权益假设 AC (22), 亚盛资金假设 U/AA/AB/AF (27/28/28/28), 阅文经营现金假设 I/Y (24/26). Core/native previous repairs remain intact. Only body rows 7 onward inherit necessary additional heights in this appended stage; header/title rows are preserved. `core_layout_extensions.mjs` and `core_layout_format.mjs` retain the same future-builder formats, and `transplant_core_layout.py` scopes include every authorized column.

Full 233-sheet native text scanner output is `native_notes_inventory_final.json`. Remaining nowrap note columns are already wide enough: 总览 A footer overflow/D, 经营桥 O, 机构目标 N, 验收 C, 乐普风险收入桥 O. Actual original sample views plus three font/width/height text spot renders confirmed complete long samples; 海尔期限估值桥 T showed its two lines fully and was left intact. Root continues original workbook QA for other content.

`final_render_manifest.json`: 90 actual saved-candidate renders, each associated with final input SHA256 and current/original sheet XML SHA256. All main-manifest ranges on changed sheets were rerendered; five original broad ranges used only as evidence of coverage have `evidenceOnly: true`, while official split ranges remain the integrated ranges. The manifest includes four added 财务原值 views (head note, longest note row 116, longest period row 434, longest unit row 4460).

`final_visual_native_append.json` contains 26 actual-original-resolution saved candidate passes. Prior 59 views remain valid by exact PNG SHA256 and earlier actual-original evidence. This agent opened exactly 40 original images total: 11 original workbook views, 3 independent text display spot images, and 26 final candidate views. Do not open more images in this agent context.

`native_final_review_summary.json`: 85/85 official release views have exact-SHA actual-original pass evidence, pending none. No unseen pass was inferred. Every saved candidate view carries final SHA metadata.

`layout_integration.json` is the dry-run result: passed true; main 559 original view indices preserved; expected 574 total views after integration; no changed-sheet original ranges missing. Neither `--apply` nor candidate installation was run. Root can integrate, guard/backup/install the exact audited candidate, then rerun its final workbook/crossformat/visual delivery gates.

Do not use interim hashes db0e or 286d. They preceded removal of donor blank-row default-height interference. Only the final 78c04246 hash above has the complete final render and exact-preservation coverage.
