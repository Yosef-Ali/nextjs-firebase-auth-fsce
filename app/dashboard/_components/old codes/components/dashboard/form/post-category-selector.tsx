import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { usePostFormStore } from '@/lib/store';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface CategorySelectorProps {
    control: Control<any>;
    categories: { _id: string; title: string }[];
    defaultValue?: string;
    onChange?: (value: string) => void;
}
const PostCategorySelector: React.FC<CategorySelectorProps> = ({
    control,
    categories,
    defaultValue,
    onChange
}) => {
    const { category, setCategory } = usePostFormStore();

    React.useEffect(() => {
        if (!category && categories.length > 0) {
            const initialCategory = defaultValue || categories[0].title;
            setCategory(initialCategory);
        }
    }, [categories, defaultValue, category, setCategory]);

    return (
        <Controller
            name="category"
            control={control}
            defaultValue={category || defaultValue || (categories[0]?.title ?? '')}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                        value={field.value}
                        onValueChange={(newValue: string) => {
                            field.onChange(newValue);
                            setCategory(newValue);
                        }}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category._id} value={category.title}>
                                    {category.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
export default PostCategorySelector;