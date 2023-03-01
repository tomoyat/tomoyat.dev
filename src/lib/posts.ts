import {parse, format} from "date-fns"
import ja from "date-fns/locale/ja/index"
import type {SvelteComponent} from "svelte";

export type Post = {
    slug: string;
    title: string;
    publishedAt: Date;
    publishedAtString: string;
    component: SvelteComponent;
    image: string | null;
    description: string | null;
};

const modules = import.meta.glob("/src/posts/*.md", {eager: true});

function basename(path: string): string {
    return path.replace(/.*\//, '');
}

function removeMd(path: string): string {
    return path.replace(/\.md/, '')
}

function formatPost(slug: string, module: any): Post {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const {metadata} = module;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const svelteComponent = module.default;
    const publishedAt = parse(metadata.date, "yyyy-MM-dd HH:mm:ss", new Date(2000, 0, 1), {
        locale: ja
    });
    return {
        slug: slug,
        component: svelteComponent,
        title: metadata.title,
        publishedAt: publishedAt,
        publishedAtString: format(publishedAt, "yyyy-MM-dd", {locale: ja}),
        image: metadata.image ? metadata.image : null,
        description: metadata.description ? metadata.description : null,
    };
}

export const posts: Post[] = Object.entries(modules).map(([filepath, module]) => {
    const slug = removeMd(basename(filepath));
    return formatPost(slug, module);
});

export const fetchPage: (slug: string) => Promise<Post> = async (slug: string) => {
    const post = await import(`../posts/${slug}.md`);
    return formatPost(slug, post);
}
