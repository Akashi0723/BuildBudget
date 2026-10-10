/** The two monogram Bs become the initials of the readable Budget Build wordmark. */
export default function BrandMark() {
  return <span className="brand" role="img" aria-label="Budget Build">
    <span className="brand-word" aria-hidden="true"><img className="brand-initial" src="/brand-initial.svg" width={24} height={40} alt=""/>udget</span>
    <span className="brand-word" aria-hidden="true"><img className="brand-initial" src="/brand-initial.svg" width={24} height={40} alt=""/>uild</span>
  </span>;
}
