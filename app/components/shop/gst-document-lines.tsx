import type { DocumentLine } from "../../lib/shop/gst-document-view";
import { formatINR } from "../../lib/shop/money";

/** Both views use the same verified values; the full table remains the print view. */
export function GstDocumentLines({ lines, text }: {
  lines: DocumentLine[];
  text: (label: string) => string;
}) {
  return <>
    <ol className="gst-mobile-lines no-print" aria-label={text("Product")}>
      {lines.map((line, index) => <li key={index}>
        <h3>{line.name}</h3>
        <dl>
          <div><dt>{text("Quantity")}</dt><dd>{line.quantity} {line.unit}</dd></div>
          <div><dt>{text("HSN / SAC")}</dt><dd>{line.classification}<span>{line.rate}</span></dd></div>
          <div><dt>{text("Before GST")}</dt><dd>{formatINR(line.net)}</dd></div>
          {line.discount > 0 ? <div><dt>{text("Discount")}</dt><dd>{formatINR(line.discount)}</dd></div> : null}
          <div><dt>{text("Taxable value")}</dt><dd>{formatINR(line.taxable)}</dd></div>
          <div><dt>{text("GST")}</dt><dd>{formatINR(line.tax)}</dd></div>
          {Object.entries(line.components).filter(([, value]) => value > 0).map(([key, value]) =>
            <div className="gst-mobile-tax" key={key}><dt>{key}</dt><dd>{formatINR(value)}</dd></div>)}
          <div className="gst-mobile-total"><dt>{text("Total")}</dt><dd>{formatINR(line.total)}</dd></div>
        </dl>
      </li>)}
    </ol>
    <div className="gst-table-wrap gst-document-table"><table className="gst-table">
      <thead><tr>{["Product", "Quantity", "HSN / SAC", "Before GST", "Taxable value", "GST", "Total"].map(label => <th scope="col" key={label}>{text(label)}</th>)}</tr></thead>
      <tbody>{lines.map((line, index) => <tr key={index}>
        <td>{line.name}</td><td>{line.quantity} {line.unit}</td><td>{line.classification}<br />{line.rate}</td>
        <td>{formatINR(line.net)}{line.discount > 0 ? <p>{text("Discount")}: {formatINR(line.discount)}</p> : null}</td>
        <td>{formatINR(line.taxable)}</td>
        <td>{formatINR(line.tax)}{Object.entries(line.components).filter(([, value]) => value > 0).map(([key, value]) => <p key={key}>{key} {formatINR(value)}</p>)}</td>
        <td>{formatINR(line.total)}</td>
      </tr>)}</tbody>
    </table></div>
  </>;
}
