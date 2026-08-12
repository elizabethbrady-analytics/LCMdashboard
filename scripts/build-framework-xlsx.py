#!/usr/bin/env python3
"""Regenerate the the program LCM Dashboard Framework workbook from the
registry dump written by build-metrics-csv.mjs. Committed to the repo
(was scratchpad-only).

Usage: node scripts/build-metrics-csv.mjs && python3 scripts/build-framework-xlsx.py [out.xlsx]
"""
import json
import os
import sys

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
DUMP = os.path.join(HERE, ".registry-dump.json")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "../../the program_LCM_Dashboard_Framework.xlsx")

rows = json.load(open(DUMP))

HDR_FILL = PatternFill("solid", fgColor="0E5B4A")
MOD_FILL = PatternFill("solid", fgColor="E7F0E4")
MOD_FILL2 = PatternFill("solid", fgColor="F4F8F2")
HDR_FONT = Font(name="Arial", size=10, bold=True, color="FFFFFF")
BODY_FONT = Font(name="Arial", size=10)
TBD_FONT = Font(name="Arial", size=10, color="B45309")
MOD_FONT = Font(name="Arial", size=10, bold=True, color="0E5B4A")
TITLE_FONT = Font(name="Arial", size=13, bold=True, color="0E5B4A")
SUB_FONT = Font(name="Arial", size=10, italic=True, color="555555")
THIN = Side(style="thin", color="D9D9D9")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")

DASH_ORDER = [
    "Overall Executive View", "Newly Enrolled", "Stars", "Consistent",
    "Engagement Exposures", "Needs Attention", "Dormant",
]
PURPOSES = {
    "Overall Executive View": "Journey performance across all LCM journeys. Round 2: and/or activation, LTV, First Purchase, product mix, prior-year benchmark, migration summary.",
    "Newly Enrolled": "Onboarding & activation journey. Round 2: 0-15/16-30 buckets, 90-day funnel stage, app vs sales activation, ISV product, enrollment-source breakdown.",
    "Stars": "Top performers. Round 2: churn rate added; Star criteria windows now first 90 days.",
    "Consistent": "Sustained usage and the path to Stars.",
    "Engagement Exposures": "Does engagement convert to migration and transactions.",
    "Needs Attention": "Split from the combined reactivation dashboard per client vote. Retention / churn / migration-up plus the shared reactivation KPI suite.",
    "Dormant": "Split per client vote. Reactivation vs prior-year benchmark, emails-to-reactivate, sunsetted contacts, plus the shared reactivation suite.",
}

by_dash = {d: [r for r in rows if r["dashboard"] == d] for d in DASH_ORDER}


def origin_text(r):
    o = r.get("origin")
    tags = []
    if o:
        tags.append(f"From {o['source'].lower()} {o['date']} ({o['by']})")
    if r.get("modeled"):
        tags.append("Illustrative model — methodology TBD")
    return " · ".join(tags)


wb = openpyxl.Workbook()
ov = wb.active
ov.title = "Dashboards"
ov["A1"] = "the program B2B LCM - Dashboard & KPI Framework"
ov["A1"].font = TITLE_FONT
ov["A2"] = "Generated from the review-site metric registry (single source of truth). Round-2 provenance carried per metric in the Origin column."
ov["A2"].font = SUB_FONT
for c, h in enumerate(["Dashboard (sheet)", "Purpose / round-2 changes", "# KPIs"], 1):
    cell = ov.cell(row=4, column=c, value=h)
    cell.font = HDR_FONT; cell.fill = HDR_FILL; cell.alignment = WRAP; cell.border = BORDER
for r, d in enumerate(DASH_ORDER, 5):
    for c, v in enumerate([d, PURPOSES[d], len(by_dash[d])], 1):
        cell = ov.cell(row=r, column=c, value=v)
        cell.font = MOD_FONT if c == 1 else BODY_FONT
        cell.alignment = WRAP; cell.border = BORDER
for col, w in zip("ABC", [26, 90, 8]):
    ov.column_dimensions[col].width = w
ov.freeze_panes = "A5"

# Build prerequisites — decisions the Tableau/DWH build cannot start without.
# Surfaced by the cross-role analytics review (debate + 8-perspective discussion).
PREREQS = [
    ("P1", "Grain + conformed join key",
     "MID vs provider vs practice must be decided, with one conformed key across application_fact, transaction_fact, segmentation segmentation, and Marketing Cloud sends.",
     "Blocks the app-and/or-transaction activation union, every per-provider average, and all dedup rules. Client docs use MIDs and providers interchangeably.",
     "Every rate and per-provider metric", "SF / platform analytics"),
    ("P2", "Quarterly segment snapshot design",
     "segmentation segment labels need period-stamped (SCD2-style) snapshots so prior-period vs current-period migration is queryable; decide quarter-grain migration views vs 'as of last refresh' framing for monthly dashboards.",
     "Labels refresh quarterly but dashboards render monthly migration — intra-quarter, migration reads stale/zero without this decision.",
     "Segment migration (all views), retention/churn/migration rates", "Platform analytics + LCM"),
    ("P3", "NCS lift holdout / attribution methodology",
     "Define the control group design and the attribution model for journey NCS.",
     "Two headline executive KPIs (NCS lift %, Contribution to goals %) are unmeasurable until this exists. Client flagged it 8/5.",
     "NCS lift %, Contribution to goals %", "Analytics team"),
    ("P4", "Journey-overlap dedup rule",
     "A provider can sit in Newly Enrolled and a segment journey simultaneously; decide distinct-provider vs sum-of-memberships counting.",
     "Executive 'Total subscribers that entered journey' has two defensible values without it; re-enrollment counting has the same ambiguity.",
     "Total subscribers entered journey; all journey-population metrics", "LCM + analytics"),
    ("B1", "Send-log join for reactivation economics",
     "Avg # emails to reactivate needs send-level history joined to reactivation events — B2B_email_engagement_fact alone (opens/clicks) is insufficient.",
     "Metric currently illustrative-modeled in the simulator.",
     "Avg # emails to reactivate", "Marketing Cloud + DWH"),
    ("B2", "Consent / suspension state sync",
     "Opt-out state and SF status=suspend need provider-level properties with a defined sync cadence.",
     "Gates reactivation sends legally and feeds % suspended + sunsetted counts.",
     "% suspended providers, Contacts sunsetted, unsubscribe metrics", "SF team"),
    ("B3", "Per-journey 'desired goal' actions",
     "Conversion rate (to desired goal) appears on all seven dashboards with the goal action undefined per journey.",
     "Untestable and unbuildable until each journey names its goal.",
     "Conversion rate (all dashboards)", "LCM team"),
    ("B4", "Pre-launch NULL display rule",
     "Journeys launch Aug 2026 (Newly Enrolled) and Oct 2026 (SCEND); trends crossing launch need a defined pre-launch display treatment.",
     "Without it, every trend starts with a misleading cliff.",
     "All trend visualizations", "Dashboard build"),
    ("B5", "Lead source persistence past enrollment",
     "Client's own open question: does lead source carry through after enrollment?",
     "If not persisted, NCS-by-source and the enrollment-source table stop at day one.",
     "Enrollment source breakdown, source-cut NCS", "SF team"),
]

COLS = ["Module", "KPI", "Definition", "Measure", "Visualization Type", "Data Source", "Origin / Flags"]
WIDTHS = [20, 32, 56, 30, 24, 38, 30]

for d in DASH_ORDER:
    ws = wb.create_sheet(title=d[:31])
    ws["A1"] = d
    ws["A1"].font = TITLE_FONT
    ws["A2"] = PURPOSES[d]
    ws["A2"].font = SUB_FONT
    for c, h in enumerate(COLS, 1):
        cell = ws.cell(row=4, column=c, value=h)
        cell.font = HDR_FONT; cell.fill = HDR_FILL; cell.alignment = WRAP; cell.border = BORDER
    prev_mod = None
    for r, m in enumerate(by_dash[d], 5):
        vals = [m["module"], m["name"], m["definition"], m["measure"], m["viz"], m["source"], origin_text(m)]
        for c, v in enumerate(vals, 1):
            cell = ws.cell(row=r, column=c, value=v)
            cell.alignment = WRAP; cell.border = BORDER
            if c == 1:
                cell.font = MOD_FONT
                if v == prev_mod:
                    cell.value = ""
                    cell.fill = MOD_FILL2
                else:
                    cell.fill = MOD_FILL
            else:
                low = str(v).lower()
                cell.font = TBD_FONT if ("tbd" in low or "open:" in low or "definition required" in low or "illustrative" in low) else BODY_FONT
        prev_mod = m["module"]
    for i, w in enumerate(WIDTHS, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A5"

# Build Prerequisites sheet (inserted right after the overview)
pre = wb.create_sheet(title="Build Prerequisites", index=1)
pre["A1"] = "Build Prerequisites — decisions required before the Tableau/DWH build"
pre["A1"].font = TITLE_FONT
pre["A2"] = "P-items block core metrics; B-items are scoped blind spots. Surfaced by the cross-role analytics review, 2026-08-07."
pre["A2"].font = SUB_FONT
PRE_COLS = ["#", "Decision needed", "What must be decided", "Why it blocks", "Affected metrics", "Suggested owner"]
for c, h in enumerate(PRE_COLS, 1):
    cell = pre.cell(row=4, column=c, value=h)
    cell.font = HDR_FONT; cell.fill = HDR_FILL; cell.alignment = WRAP; cell.border = BORDER
for r, row in enumerate(PREREQS, 5):
    for c, v in enumerate(row, 1):
        cell = pre.cell(row=r, column=c, value=v)
        cell.alignment = WRAP; cell.border = BORDER
        cell.font = MOD_FONT if c == 1 else (TBD_FONT if row[0].startswith("P") and c == 2 else BODY_FONT)
for col, w in zip("ABCDEF", [5, 30, 52, 46, 38, 22]):
    pre.column_dimensions[col].width = w
pre.freeze_panes = "A5"

wb.save(OUT)
print("saved", OUT, "| dashboards:", len(DASH_ORDER), "| rows:", len(rows), "| prereqs:", len(PREREQS))
