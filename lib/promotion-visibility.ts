export function shouldShowPromotion({
  ageVerified,
  seen,
  active,
  available,
  hidden,
}: {
  ageVerified: boolean;
  seen: boolean;
  active: boolean;
  available: boolean;
  hidden: boolean;
}) {
  return ageVerified && !seen && active && available && !hidden;
}
