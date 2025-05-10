export type XPathSet = {
    title: string
    description: string
    date: string
    thumbnail: string
}

type AutoDetectResponse = {
    success: true;
    data: XPathSet;
} | {
    success: false;
    error: string;
};

export function initXPathSet(): XPathSet {
    return {
        title: "",
        description: "",
        date: "",
        thumbnail: "",
    }
}

export async function loadXPathSet(id: string): Promise<XPathSet> {
    const response = await fetch('/api/load/xpath?id=' + id);

    if (!response.ok) {
        return {
            title: "",
            description: "",
            date: "",
            thumbnail: "",
        }
    }

    return await response.json();
}

export async function autoDetectXPathSet(url: string): Promise<AutoDetectResponse> {
    const response = await fetch('/api/auto?url=' + url);

    if (!response.ok) {
        const errorText = await response.text();
        return {
            success: false,
            error: errorText || "Server returned an error response.",
        };
    }

    const data: XPathSet = await response.json();

    return {
        success: true,
        data,
    };
}