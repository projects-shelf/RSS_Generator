import { loadXPathSet, autoDetectXPathSet } from "@/class/xpath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/mydialog"

export enum EditType {
	Edit,
	Add,
	Error,
}

enum InputType {
	title,
	description,
	date,
	thumbnail,
}

export default function EditPage() {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const [searchParams] = useSearchParams();
	const query_url = searchParams.get("url");
	const query_id = searchParams.get("id");
	const query_type = (query_url != null && query_url != "")
		? (query_id != null && query_id != "")
			? EditType.Edit
			: EditType.Add
		: EditType.Error;

	if (query_type == EditType.Error) {
		return (
			<div className="p-4">
				<h1>Error</h1>
			</div>
		)
	}

	const url = query_url;
	let last_selected: string | null
	const [titleX, setTitleX] = useState("");
	const [descriptionX, setDescriptionX] = useState("");
	const [dateX, setDateX] = useState("");
	const [thumbnailX, setThumbnailX] = useState("");

	useEffect(() => {
		let iframeLoaded = false;

		async function fetchXpathAndHighlight() {
			if (query_type == EditType.Edit && query_id) {
				const xpath = await loadXPathSet(query_id);
				setTitleX(xpath.title);
				setDescriptionX(xpath.description);
				setDateX(xpath.date);
				setThumbnailX(xpath.thumbnail);

				const iframeDoc = iframeRef.current?.contentDocument;
				if (iframeDoc) {
					highlightElementsInIframe(iframeDoc, xpath.title, InputType.title);
					highlightElementsInIframe(iframeDoc, xpath.description, InputType.description);
					highlightElementsInIframe(iframeDoc, xpath.date, InputType.date);
					highlightElementsInIframe(iframeDoc, xpath.thumbnail, InputType.thumbnail);
				}
			}
		}

		const onIframeLoad = () => {
			iframeLoaded = true;

			const iframeDoc = iframeRef.current?.contentDocument;
			if (!iframeDoc) return;

			// set highlight css
			const link = iframeDoc.createElement("link");
			link.rel = "stylesheet";
			link.href = "/iframe.css";
			iframeDoc.head.appendChild(link);

			if (query_type == EditType.Edit) {
				fetchXpathAndHighlight();
			}

			// detect rss link
			const rssLink = iframeDoc.querySelector(
				'link[rel="alternate"][type="application/rss+xml"]'
			) as HTMLLinkElement | null;
			if (rssLink?.href) {
				showRSSToast(rssLink.href);
			}

			// detect click
			iframeDoc.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				const target = event.target as Element;
				const xpath = getXPath(target);
				if (last_selected) {
					const input = document.getElementById(last_selected) as HTMLInputElement | null;
					if (input) {
						input.value = xpath;
						input.dispatchEvent(new Event("input", { bubbles: true }));
					}
				}
			});
		};

		iframeRef.current?.addEventListener("load", onIframeLoad);

		const handleFocus = (event: FocusEvent) => {
			const target = event.target as HTMLElement;
			if (target.tagName === "INPUT" && target.id) {
				last_selected = target.id;
			}
		};

		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (target.tagName !== "INPUT" && !(target.closest("iframe"))) {
				last_selected = null;
			}
		};

		document.addEventListener("focusin", handleFocus);
		document.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("focusin", handleFocus);
			document.removeEventListener("click", handleClick);
			iframeRef.current?.removeEventListener("load", onIframeLoad);
		};
	}, []);


	const [isOpen, openDialog] = useState(false);
	const [id, setId] = useState("");
	const navigate = useNavigate();

	return (
		<div className="flex p-4 w-full">
			<div className="w-full h-full rounded-xl overflow-hidden shadow-lg border">
				<iframe
					src={makeProxyInitURL(addTrailingSlash(decodeURIComponent(url!)))}
					ref={iframeRef}
					style={{ width: "100%", height: "100%" }}
				/>
			</div>
			<div className="p-4">
				<div className="grid w-full max-w-sm items-center">
					<Button
						className="w-full"
						onClick={async () => {
							if (titleX == "") {
								toast.error('Error: Title is Required')
								return
							}

							if (query_type == EditType.Add) {
								const response = await fetch(`/api/add?` + new URLSearchParams({
									url: url!,
									titleX: titleX,
									descriptionX: descriptionX,
									dateX: dateX,
									thumbnailX: thumbnailX
								}));
								const data = await response.json();

								if (!response.ok) {
									toast.error(`Error: ${data.error}`)
								} else {
									setId(data.id)
									openDialog(true)
								}
							}

							if (query_type == EditType.Edit) {
								const response = await fetch(`/api/edit?` + new URLSearchParams({
									id: query_id!,
									titleX: titleX,
									descriptionX: descriptionX,
									dateX: dateX,
									thumbnailX: thumbnailX
								}));
								const data = await response.json();

								if (!response.ok) {
									toast.error(`Error: ${data.error}`)
								} else {
									setId(query_id!)
									openDialog(true)
								}
							}
						}}
					>Generate</Button>
					<div className="h-5" />
					<Button variant="secondary" className="w-full"
						onClick={() => {
							const promise = autoDetectXPathSet(url!);

							toast.promise(promise, {
								loading: "Auto Detecting...",
								success: (res) => {
									if (res.success) {
										const xpath = res.data
										setTitleX(xpath.title)
										setDescriptionX(xpath.description)
										setDateX(xpath.date)
										setThumbnailX(xpath.thumbnail)
										const iframeDoc = iframeRef.current?.contentDocument;
										if (iframeDoc) {
											highlightElementsInIframe(iframeDoc, xpath.title, InputType.title);
											highlightElementsInIframe(iframeDoc, xpath.description, InputType.description);
											highlightElementsInIframe(iframeDoc, xpath.date, InputType.date);
											highlightElementsInIframe(iframeDoc, xpath.thumbnail, InputType.thumbnail);
										}
										return "Auto Detection completed";
									} else {
										throw new Error(res.error); // これにより `error` ハンドラに渡る
									}
								},
								error: (err) => err.message
							});
						}}>Auto Detect</Button>
					<div className="h-5" />
					<span style={{ color: '#bb0000' }}>
						<Label htmlFor="title" className="my-2">Title</Label>
						<Input
							type="text" id="title" placeholder="Required" value={titleX}
							onInput={(e) => {
								const value = (e.target as HTMLInputElement).value;

								setTitleX(value)

								const iframeDoc = iframeRef.current?.contentDocument;
								if (iframeDoc) {
									highlightElementsInIframe(iframeDoc, value, InputType.title);
								}
							}}
						/>
					</span>
					<div className="h-3.5" />
					<span style={{ color: '#005ebd' }}>
						<Label htmlFor="description" className="my-2">Description</Label>
						<Input
							type="text" id="description" placeholder="Optional" value={descriptionX}
							onInput={(e) => {
								const value = (e.target as HTMLInputElement).value;

								setDescriptionX(value)

								const iframeDoc = iframeRef.current?.contentDocument;
								if (iframeDoc) {
									highlightElementsInIframe(iframeDoc, value, InputType.description);
								}
							}}
						/>
					</span>
					<div className="h-3.5" />
					<span style={{ color: '#006400' }}>
						<Label htmlFor="date" className="my-2">Date</Label>
						<Input
							type="text" id="date" placeholder="Optional" value={dateX}
							onInput={(e) => {
								const value = (e.target as HTMLInputElement).value;

								setDateX(value)

								const iframeDoc = iframeRef.current?.contentDocument;
								if (iframeDoc) {
									highlightElementsInIframe(iframeDoc, value, InputType.date);
								}
							}}
						/>
					</span>
					<div className="h-3.5" />
					<span style={{ color: '#B8860B' }}>
						<Label htmlFor="thumbnail" className="my-2">Thumbnail</Label>
						<Input
							type="text" id="thumbnail" placeholder="Optional" value={thumbnailX}
							onInput={(e) => {
								const value = (e.target as HTMLInputElement).value;

								setThumbnailX(value)

								const iframeDoc = iframeRef.current?.contentDocument;
								if (iframeDoc) {
									highlightElementsInIframe(iframeDoc, value, InputType.thumbnail);
								}
							}}
						/>
					</span>
				</div >
			</div >

			<Dialog open={isOpen} onOpenChange={openDialog}>
				<DialogContent onInteractOutside={(e) => e.preventDefault()}>
					<DialogHeader>
						<DialogTitle>RSS generated</DialogTitle>
						<DialogDescription>
							<div className="flex">
								{window.location.origin + "/api/rss?id=" + id}
								<div className="w-3.5" />
								<Copy onClick={() => {
									navigator.clipboard.writeText(window.location.origin + "/api/rss?id=" + id)
									toast("Link Copied!")
								}} />
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => navigate(`/`)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div >
	)
}

function addTrailingSlash(url: string) {
	const hasQuery = url.includes('?');

	// スラッシュが末尾にない場合に追加
	if (url && !url.endsWith('/') && hasQuery) {
		return url.replace('?', '/?');
	} else if (url && !url.endsWith('/')) {
		return url + '/';
	}
	return url;
}

function makeProxyInitURL(url: string) {
	return `/proxy_init/${(url.replace("://", "/"))}`;
}

function showRSSToast(rss_url: string) {
	toast(
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<div>
				<h1>An RSS feed was found!</h1>
				<h1>{rss_url}</h1>
			</div>
			<Copy className="w-6 h-6"
				style={{ marginLeft: '20px' }}
				onClick={() => navigator.clipboard.writeText(rss_url)}
			/>
		</div>,
		{
			position: "top-right"
		})
}

export function getXPath(element: Element): string {
	const paths: string[] = [];
	while (element.nodeType === Node.ELEMENT_NODE) {
		const tagName = element.nodeName.toLowerCase();
		let path = tagName;

		if (element.id) {
			path += `[@id="${element.id}"]`;
		}
		else if (element.className) {
			const excludedClasses = new Set([
				"xpath-highlight-red",
				"xpath-highlight-blue",
				"xpath-highlight-green",
				"xpath-highlight-yellow"
			]);
			const classList = Array.from(element.classList).filter(
				cls => !excludedClasses.has(cls)
			);
			if (classList.length > 0) {
				path += `[@class="${classList.join(" ")}"]`;
			}
		}

		paths.unshift(path);
		element = element.parentNode as Element;
	}

	return `/${paths.join("/")}`;
}

function highlightElementsInIframe(doc: Document, xpath: string, type: InputType) {
	var classname = ""
	switch (type) {
		case InputType.title:
			classname = "xpath-highlight-red";
			break;
		case InputType.description:
			classname = "xpath-highlight-blue";
			break;
		case InputType.date:
			classname = "xpath-highlight-green";
			break;
		case InputType.thumbnail:
			classname = "xpath-highlight-yellow";
			break;
	}
	doc.querySelectorAll(`.${classname}`).forEach((el) => {
		el.classList.remove(classname);
	});

	const elements = getElementsByXPath(doc, xpath);
	elements.forEach(el => el.classList.add(classname));
}


function getElementsByXPath(doc: Document, xpath: string): Element[] {
	const result: Element[] = [];
	try {
		const iterator = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		let node = iterator.iterateNext();
		while (node) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				result.push(node as Element);
			}
			node = iterator.iterateNext();
		}
	} catch (e) {
		console.warn("Invalid XPath or evaluation error", e);
	}
	return result;
}
