export function shouldShowInnovationValueContent(
  isSelected: boolean,
  hasSelectedOption: boolean,
  detailHtml?: string | null,
): boolean {
  return isSelected || hasSelectedOption || Boolean(detailHtml?.trim());
}
