from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io

def generate_certificate(cert_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    elements = []

    # Header style
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=18,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1a3c5e'),
        spaceAfter=6
    )

    sub_header_style = ParagraphStyle(
        'SubHeader',
        parent=styles['Normal'],
        fontSize=12,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        textColor=colors.HexColor('#2e7d32'),
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        alignment=TA_LEFT,
        spaceAfter=6,
        leading=16
    )

    center_style = ParagraphStyle(
        'Center',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        alignment=TA_CENTER,
        spaceAfter=6
    )

    bold_center = ParagraphStyle(
        'BoldCenter',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceAfter=6
    )

    # Determine decision color
    decision = cert_data.get("decision", "")
    if decision == "Approve":
        decision_color = colors.HexColor('#2e7d32')
    elif decision == "Conditional":
        decision_color = colors.HexColor('#e65100')
    else:
        decision_color = colors.HexColor('#c62828')

    decision_style = ParagraphStyle(
        'Decision',
        parent=styles['Normal'],
        fontSize=20,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        textColor=decision_color,
        spaceAfter=10
    )

    # ---- Build document ----

    elements.append(Paragraph("REPUBLIC OF KENYA", header_style))
    elements.append(Paragraph("Kenya Fisheries Service (KeFS)", header_style))
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1a3c5e')))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("FISH LANDING STATION INSPECTION CERTIFICATE", sub_header_style))
    elements.append(Paragraph("Risk-Based Inspection and Certification System", center_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc')))
    elements.append(Spacer(1, 14))

    # Certificate ID and date
    elements.append(Paragraph(f"Certificate No: KEFS-CERT-{cert_data.get('cert_id', 'N/A')}", bold_center))
    elements.append(Paragraph(f"Issued Date: {cert_data.get('issued_date', 'N/A')}", center_style))
    elements.append(Spacer(1, 16))

    # Decision
    elements.append(Paragraph("CERTIFICATION DECISION", sub_header_style))
    elements.append(Paragraph(decision.upper(), decision_style))
    elements.append(Spacer(1, 10))

    # Details table
    table_data = [
        ["Field", "Details"],
        ["Inspection ID", str(cert_data.get("inspection_id", "N/A"))],
        ["Landing Station", cert_data.get("landing_station", "N/A")],
        ["County", cert_data.get("county", "N/A")],
        ["Inspection Date", cert_data.get("inspection_date", "N/A")],
        ["Inspector", cert_data.get("inspector_name", "N/A")],
        ["Risk Level", cert_data.get("risk_level", "N/A")],
        ["Final Risk Score", str(cert_data.get("final_risk_score", "N/A"))],
        ["Issued By", cert_data.get("issued_by_name", "N/A")],
    ]

    table = Table(table_data, colWidths=[180, 320])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a3c5e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f5f5f5'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 16))

    # Remarks
    elements.append(Paragraph("REMARKS", sub_header_style))
    elements.append(Paragraph(cert_data.get("remarks", "No remarks"), body_style))
    elements.append(Spacer(1, 20))

    # Footer
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc')))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "This certificate is issued by the Kenya Fisheries Service under the authority of the Fisheries Act Cap 378.",
        center_style
    ))
    elements.append(Paragraph(
        "For verification, contact KeFS headquarters: P.O Box 58187-00200, Nairobi | www.kefs.go.ke",
        center_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()