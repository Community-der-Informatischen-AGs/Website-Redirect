import cn from "classnames"
import { NextPage } from "next"
import Head from "next/head"
import { ParsedUrlQuery } from "querystring"
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react"
import {
  Footer,
  Header,
  SearchComponent,
  CollectionNavigation,
} from "../components"
import {
  COLLECTION_TYPE_IDS,
  CONTENTFUL_ID_QUERY,
} from "../lib/contentful/constants"
import { KEYWORDS } from "../lib/utils/constants"

import { getPreviewPost } from "../lib/contentful/util"
import globalStyles from "./../styles/globals.module.scss"
import postStyles from "./../styles/collection_page/post_preview_component.module.scss"
import styles from "./../styles/search/search.module.scss"
import searchStyles from "./../styles/search/search_component.module.scss"

const validateQuery = (searchValue: string) => {
  return (
    searchValue != "undefined" &&
    searchValue != "" &&
    searchValue.length >= 2
  )
}

// TODO: fix preview styling

interface SearchResult {
  contentTypeId: string
  id: string
}

// the amount of post previews per type.
// 5 -> max. 5 project posts + 5 blog posts + 5 school entries per post
const pagePostTypeTotal = 5

const Search: NextPage<ParsedUrlQuery> = (
  p: ParsedUrlQuery
) => {
  const query = p.s as string

  let heading = `CDIA - Suche - ${query}`
  let titleSentence = ["Suchergebnisse für", `"${query}"`]
  let titleIndex = 1
  if (!validateQuery(query)) {
    heading = `CDIA - Suche`
    titleSentence = [KEYWORDS.nameSeparate, "Suche"]
  }

  const [resultPreviewData, setResultPreviewData] =
    useState<SearchResult[]>([])

  // tells the code how many posts to skip when querying the data
  const skipState = useState(0)

  const [currentSkipAmount, setCurrentSkipAmount] =
    skipState
  // querying data for posts
  useEffect(() => {
    const results: SearchResult[] = []

    Object.values(COLLECTION_TYPE_IDS).forEach(
      (contentTypeCollectionId: string) => {
        const response = fetch(
          "/api/contentful/collection",
          {
            method: "POST",
            body: JSON.stringify({
              collectionType: contentTypeCollectionId,
              limit: pagePostTypeTotal,
              itemQuery: `
              ${CONTENTFUL_ID_QUERY}
            `,
              filter: `
            OR: [
              { title_contains: "${query}" }
              { body_contains: "${query}" }
            ]
            `,
              skip: currentSkipAmount,
            }),
          }
        )

        response.then(async (response) => {
          const data = (await response.json()).data[
            contentTypeCollectionId
          ]
          const items = data.items

          for (const item of items) {
            results.push({
              contentTypeId:
                contentTypeCollectionId.replace(
                  "Collection",
                  ""
                ),
              id: item.sys.id,
            })
          }

          setResultPreviewData([...results])
        })
      }
    )
  }, [query, currentSkipAmount])

  return (
    <>
      <Head>
        <title>
          {KEYWORDS.nameSeparate} - {heading}
        </title>
        <meta
          name="description"
          content="Die Such Seite der CDIA"
        />
      </Head>
      <Header
        onSearch={() => {
          setCurrentSkipAmount(0)
        }}
      />
      <main>
        <section
          className={cn(
            styles.headingSection,
            globalStyles.headingSection
          )}
        >
          <h1>
            {titleSentence.map(
              (word: string, index: number) => {
                return (
                  <span
                    key={index}
                    style={{
                      opacity:
                        index == titleIndex ? 1 : 0.1,
                    }}
                  >
                    {word}
                  </span>
                )
              }
            )}
          </h1>
          <SearchComponent
            optStyles={searchStyles}
            onSearch={() => {
              setCurrentSkipAmount(0)
            }}
          />
        </section>
        <section
          className={cn(
            globalStyles.standardPaddingSection,
            styles.resultsSection
          )}
        >
          <CollectionNavigation
            skipState={skipState}
            currentDataLength={resultPreviewData.length}
            total={pagePostTypeTotal}
          />
          {resultPreviewData.length == 0 ? (
            <h1 className={styles.nothing}>
              <span>nichts.</span>
              <span>¯\_(ツ)_/¯</span>
            </h1>
          ) : (
            resultPreviewData.map((result, index) => {
              return getPreviewPost(
                postStyles,
                result.contentTypeId,
                result.id,
                index
              )
            })
          )}
          <CollectionNavigation
            skipState={skipState}
            currentDataLength={resultPreviewData.length}
            total={pagePostTypeTotal}
          />
        </section>
      </main>
      <Footer />
    </>
  )
}
Search.getInitialProps = async ({ query }) => {
  return { ...query }
}

export default Search