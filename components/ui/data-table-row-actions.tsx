"use client"

import { Row } from "@tanstack/react-table"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
    actions?: {
        label: string
        onClick: (row: TData) => void
    }[]
}

export function DataTableRowActions<TData>({
    row,
    actions = [],
}: DataTableRowActionsProps<TData>) {
    if (!actions.length) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {actions.map((action) => (
                    <DropdownMenuItem
                        key={action.label}
                        onClick={() => action.onClick(row.original)}
                    >
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
