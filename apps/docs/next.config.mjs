import nextra from "nextra"

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: { codeblocks: false },
  staticImage: true,
  readingTime: true,
})

export default withNextra({
  reactStrictMode: true,
  transpilePackages: ["@better-seo/core", "@better-seo/next"],
})
