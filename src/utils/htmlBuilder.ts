export function secondsToTimeFormat(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export class HTMLElement {
  private tag: string;
  private attributes: Record<string, string>;
  private children: (HTMLElement | string)[];

  constructor(tag: string) {
    this.tag = tag;
    this.attributes = {};
    this.children = [];
  }

  addAttribute(key: string, value: string): HTMLElement {
    this.attributes[key] = value;
    return this;
  }

  addChild(child: HTMLElement | string): HTMLElement {
    this.children.push(child);
    return this;
  }

  addChildren(children: (HTMLElement | string)[]): HTMLElement {
    this.children.push(...children);
    return this;
  }

  toString(): string {
    const attrs = Object.entries(this.attributes)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join("");
    const children = this.children
      .map((child) => (typeof child === "string" ? child : child.toString()))
      .join("");
    return `<${this.tag}${attrs}>${children}</${this.tag}>`;
  }
}

export function generateHTMLTable(
  dataArray: Record<string, any>[],
  skipFields: string[] = [], // Optional parameter to skip fields
  extraColumns: string[] = [] // Additional column names to append
): HTMLElement {
  const table = new HTMLElement("table");

  // Filter out the fields to be skipped
  const keys = Object.keys(dataArray[0]).filter(
    (key) => !skipFields.includes(key)
  );

  // Helper function to add spaces to camelCase or PascalCase keys
  const formatTitle = (key: string): string =>
    key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();

  // Combine main keys with extra columns for the header
  const allKeys = [...keys, ...extraColumns];

  // Add header row with formatted titles
  const headerRow = new HTMLElement("tr").addChildren(
    allKeys.map((key) => new HTMLElement("th").addChild(formatTitle(key)))
  );
  table.addChild(headerRow);

  // Add data rows
  dataArray.forEach((data) => {
    const dataRow = new HTMLElement("tr").addChildren(
      allKeys.map((key) => {
        if (keys.includes(key)) {
          // Populate values for main keys
          if (key === "spentTime") {
            return new HTMLElement("td").addChild(
              secondsToTimeFormat(data[key])
            );
          }
          return new HTMLElement("td").addChild(String(data[key]));
        }
        // Leave extra columns empty
        return new HTMLElement("td").addChild("");
      })
    );
    table.addChild(dataRow);
  });

  return table;
}
