import React, { useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
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

const CategorySelector = ({ control, categories, defaultValue, onChange }: CategorySelectorProps) => {
    // Initialize category in store when component mounts
    useEffect(() => {
        if (defaultValue) {
            onChange?.(defaultValue);
        }
    }, []); // Run only once on mount

    return (
        <Controller
            name="category"
            control={control}
            defaultValue={defaultValue}
            render={({ field: { value, onChange: fieldOnChange, ...rest } }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                        value={value || defaultValue}
                        onValueChange={(newValue) => {
                            fieldOnChange(newValue);
                            onChange?.(newValue);
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

export default CategorySelector;