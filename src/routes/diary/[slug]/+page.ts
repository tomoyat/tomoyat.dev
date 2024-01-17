import {fetchPage} from '$lib/posts'

export const load = async ({params}) => {
    const post = await fetchPage(params.slug);
    if (post.type != "diary") {
        return null;
    }
    return {
        post: post,
        slug: params.slug,
    };
}
