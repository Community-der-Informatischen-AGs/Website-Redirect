import { Document } from "@contentful/rich-text-types"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import styles from "./blog_post_preview_component.module.scss"
import React, { useEffect, useState } from "react"
import { PostPreviewComponent } from "../post_preview_component"

const contentTypeId = "blogPost"
const contentType = "Blog Post"

export interface BlogPostPreviewComponentProps {
  entryId: string
}

export interface ContentfulBlogPostProps {
  author: string
  contentType: string
  title: string
  body: Document
  publishedAt: string
  image: {
    imageUrl: string
    imageHeight: number
    imageWidth: number
    imageTitle: string
  }
}

const lazyLoad = async (
  props: BlogPostPreviewComponentProps
) => {
  console.log("lazy load content now")

  const bodyJson = {
    entryType: contentTypeId,
    entryId: props.entryId,
    entryQuery: `
      title
      author {
        title
      }
      optionalTitleMediaCollection (limit: 1) {
        items {
          title,
          url,
          height,
          width,
        } 
      }
      body {
        json
      }
      sys {
        publishedAt
      }
    `,
  }
  const responsePostData = await fetch(
    "/api/contentful/entry",
    {
      method: "POST",
      body: JSON.stringify(bodyJson),
    }
  )

  const responseJsonData = (await responsePostData.json())
    .data.blogPost
  console.log(responseJsonData)
  const title = responseJsonData.title
  const bodyDocument = responseJsonData.body.json
  // TODO: add locales!
  const publishedAt = new Date(
    responseJsonData.sys.publishedAt
  ).toLocaleDateString()
  const image =
    responseJsonData.optionalTitleMediaCollection.items[0]
  const imageUrl = image.url
  const imageHeight = image.height
  const imageWidth = image.width
  const imageTitle = image.title
  const author = responseJsonData.author.title

  return {
    author: author,
    contentType: contentTypeId,
    title: title,
    body: bodyDocument,
    publishedAt: publishedAt,
    image: {
      imageUrl: imageUrl,
      imageHeight: imageHeight,
      imageWidth: imageWidth,
      imageTitle: imageTitle,
    },
  }
}

export const BlogPostPreviewComponent = (
  props: BlogPostPreviewComponentProps
) => {
  const [postProps, setPostProps] =
    useState<ContentfulBlogPostProps>(null!)
  // lazy-loading post data

  useEffect(() => {
    lazyLoad(props).then((props) => setPostProps(props))
  }, [props])

  return postProps == null ? null : (
    <PostPreviewComponent
      entryId={props.entryId}
      contentType={contentType}
      contentTypeId={contentTypeId}
      title={postProps.title}
      body={documentToReactComponents(postProps.body)}
      image={postProps.image}
      className={styles.blogPostPreviewComponent}
      imageSectionClassName={styles.previewImage}
      textSectionClassName={styles.previewText}
    >
      <p>
        Published by {postProps.author} on{" "}
        {postProps.publishedAt}
      </p>
    </PostPreviewComponent>
  )
}
