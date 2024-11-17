import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useController } from "react-hook-form";

type Category = {
  _id: string;
  _creationTime: number;
  title: string;
  description: string;
};

type CategorySelectorProps = {
  control: any;
  categories: Category[];
};

const CategorySelector = ({ control, categories }: CategorySelectorProps) => {
  const {
    field: { value, onChange },
  } = useController({
    name: "category",
    control,
  });
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select category">
          {value ? value : "Select category"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category: Category) => (
          <SelectItem key={category._id} value={category.title}>
            {category.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector;
