"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Data, Status } from "../../class/data"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const createColumns = (
    navigate: (path: string) => void,
    onDelete: (id: string) => void
): ColumnDef<Data>[] => [
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const data = row.original
                switch (data.status) {
                    case Status.Unaccessed:
                        return <span style={{ color: 'grey' }}>Unaccessed</span>;
                    case Status.Successed:
                        return <span style={{ color: 'green' }}>Successed</span>;
                    case Status.Failed:
                        return <span style={{ color: 'red' }}>Failed</span>;
                    default:
                        return '';
                }
            },
        },
        {
            accessorKey: "url",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        URL
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            id: "rss",
            enableHiding: false,
            cell: ({ row }) => {
                const data = row.original

                return (
                    <Button
                        variant="ghost" className="h-8 w-8 p-0"
                        onClick={() => window.open(window.location.origin + "/api/rss?id=" + data.id + "&isView=1", "_blank")}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const data = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin + "/api/rss?id=" + data.id)
                                    toast("Link Copied!")
                                }}
                            >
                                Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigate(`/edit?url=${encodeURIComponent(data.url)}&id=${data.id}`)}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(data.id)} >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu >
                )
            },
        },
    ]
