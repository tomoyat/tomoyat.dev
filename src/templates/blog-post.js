import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { MDXRenderer } from "gatsby-plugin-mdx"

export default function BlogPost({ data }) {
  const post = data.mdx
  return (
    <Layout>
      <div style={{ margin: `3rem auto`, maxWidth: 960 }}>
        <h1>{post.frontmatter.title}</h1>
        <p>{post.frontmatter.date}</p>
        <MDXRenderer>{post.body}</MDXRenderer>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      body
      frontmatter {
        title,
        date(formatString: "YYYY/MM/DD")
      }
    }
  }
`