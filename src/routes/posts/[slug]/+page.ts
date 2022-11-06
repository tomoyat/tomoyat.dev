import type {PageLoad} from "../../../../.svelte-kit/types/src/routes/$types";

export const load: PageLoad = async ({params}) => {
    const post = await import(`../../../posts/${params.slug}.md`)

    const { title, date } = post.metadata
    const content = post.default

    return {
        content: content,
        title: title,
    }
}
