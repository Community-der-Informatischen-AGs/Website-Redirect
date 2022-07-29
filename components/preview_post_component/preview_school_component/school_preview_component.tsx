import { useEffect, useState } from "react"
import { CONTENT_TYPE_IDS } from "../../../lib/contentful/constants"
import { CONTENT_TYPES } from "../../../lib/utils/constants"
import { ImageData } from "../../../lib/utils/types"
import {
  PostPreviewComponent,
  processImageData,
} from "../post_preview_component"
import styles from "./school_preview_component.module.scss"

const CONTENT_TYPE_ID = CONTENT_TYPE_IDS.school
const CONTENT_TYPE = CONTENT_TYPES.school

export interface SchoolPreviewComponentProps {
  entryId: string
}

export interface ContentfulSchoolPostPreviewProps {
  title: string
  image?: ImageData
  agWebsite: string
}

const lazyLoad = async (
  props: SchoolPreviewComponentProps
) => {
  console.log("lazy load content now")

  const bodyJson = {
    entryType: CONTENT_TYPE_ID,
    entryId: props.entryId,
    entryQuery: `
      title
      picture {
        height
        width
        url
        title
      }
      agWebsite
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
    .data.schoolEntry
  const title = responseJsonData.title
  const agWebsiteUrl = responseJsonData.agWebsite
  const image = responseJsonData.picture

  return {
    contentType: CONTENT_TYPE_ID,
    title: title,
    agWebsite: agWebsiteUrl,
    image: processImageData(image),
  }
}

export const SchoolPreviewComponent = (
  props: SchoolPreviewComponentProps
) => {
  const [postProps, setPostProps] =
    useState<ContentfulSchoolPostPreviewProps>(null!)
  // lazy-loading post data

  useEffect(() => {
    lazyLoad(props).then((props) => setPostProps(props))
  }, [props])

  return postProps == null ? null : (
    <PostPreviewComponent
      entryId={props.entryId}
      contentType={CONTENT_TYPE}
      contentTypeId={CONTENT_TYPE_ID}
      title={postProps.title}
      image={postProps.image}
      className={styles.schoolPreviewComponent}
      imageSectionClassName={styles.previewImage}
      textSectionClassName={styles.previewText}
    >
      <a href={postProps.agWebsite}>
        {postProps.agWebsite}
      </a>
    </PostPreviewComponent>
  )
}
