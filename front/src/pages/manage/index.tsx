import { toast } from "sonner";
import { Data, loadDataList } from "../../class/data"
import { createColumns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from "react-router-dom";

export default function ManagePage() {
	const [data, setData] = useState<Data[]>([])
	const navigate = useNavigate();
	const columns = useMemo(() => createColumns(navigate, handleDelete), [navigate]);

	useEffect(() => {
		async function fetchData() {
			const res = await loadDataList()
			setData(res)
		}
		fetchData()
	}, [])

	async function handleDelete(id: string) {
		const res = await fetch(`/api/delete?id=${id}`)

		if (res.ok) {
			toast("Deleted successfully")
			setData(prev => prev.filter(d => d.id !== id))
		} else {
			toast("Failed to delete")
		}
	}

	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={data} />
		</div>
	)
}