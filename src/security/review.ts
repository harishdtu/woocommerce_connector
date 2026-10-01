export function buildSecurityReview() {
  return {
    readOnly: true,
    allowListEnabled: true,
    arbitraryEndpointBlocked: true,
    secretLoggingBlocked: true,
    inputValidationEnabled: true,
    paginationBounded: true,
    retriesBounded: true,
  };
}
