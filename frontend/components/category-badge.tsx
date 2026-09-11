import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category?: string
}

const getCategoryVariant = (variant: string | undefined): string | undefined => {
  switch (variant) {
    case 'backpacker':
      return 'bg-emerald-700 text-white';
    case 'standard':
      return 'bg-blue-700 text-white';
    case 'luxury':
      return 'bg-violet-700 text-white';
    default:
      return undefined;
  }
}

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  return (
    <Badge className={cn('p-2 pb-3 text-xs rounded-sm', getCategoryVariant(category))}>{category}</Badge>
  )
}

export { CategoryBadge, getCategoryVariant };
export type  { CategoryBadgeProps };
