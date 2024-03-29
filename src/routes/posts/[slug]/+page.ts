import {fetchPage} from '$lib/posts'

export const load = async ({params}) => {
    const post = await fetchPage(params.slug);
    if (post.type != "tech") {
        return null;
    }
    return {
        post: post,
        slug: params.slug,
    };
}
