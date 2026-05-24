import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export async function getLegalContent(
  section: string,
  locale: string,
  version = "v1",
) {
  const filepath = path.join(
    process.cwd(),
    "content",
    "legal",
    section,
    locale,
    `${version}.mdx`,
  );
  try {
    const raw = await fs.readFile(filepath, "utf8");
    const { content, data } = matter(raw);
    return { content, frontmatter: data };
  } catch {
    return null;
  }
}
