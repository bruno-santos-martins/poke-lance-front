type Rgba = [number, number, number, number];

function parseColor(value: string): Rgba {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) throw new Error(`Formato de cor não suportado: ${value}`);
  const [r, g, b, a = "1"] = match[1].split(/[\s,/]+/).filter(Boolean);
  return [Number(r), Number(g), Number(b), Number(a)];
}

function relativeLuminance([r, g, b]: Rgba): number {
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** First non-transparent background going up the tree (the page background as a fallback). */
function effectiveBackground(element: Element): Rgba {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const color = parseColor(getComputedStyle(node).backgroundColor);
    if (color[3] > 0) return color;
  }
  return parseColor(getComputedStyle(element.ownerDocument.documentElement).backgroundColor);
}

function contrastRatio(element: Element): number {
  const foreground = relativeLuminance(parseColor(getComputedStyle(element).color));
  const background = relativeLuminance(effectiveBackground(element));
  const [lighter, darker] = foreground > background ? [foreground, background] : [background, foreground];
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA for normal text.
const MINIMUM_CONTRAST = 4.5;

function assertReadable(selector: string) {
  cy.get(selector).first().should(($element) => {
    const ratio = contrastRatio($element[0]);
    expect(ratio, `contraste de "${selector}"`).to.be.at.least(MINIMUM_CONTRAST);
  });
}

describe("Tema claro/escuro e acessibilidade", () => {
  beforeEach(() => {
    cy.visitAsGuest();
  });

  it("começa no tema claro e alterna para o escuro pelo botão", () => {
    cy.get("html").should("have.attr", "data-theme", "light");
    cy.get("[data-cy=theme-toggle]").should("have.attr", "aria-label", "Ativar tema escuro");

    cy.get("[data-cy=theme-toggle]").click();

    cy.get("html").should("have.attr", "data-theme", "dark");
    cy.get("[data-cy=theme-toggle]").should("have.attr", "aria-label", "Ativar tema claro");
  });

  it("guarda a preferência entre visitas", () => {
    cy.setTheme("dark");
    cy.window().its("localStorage").invoke("getItem", "pokemon-auction-theme").should("eq", "dark");

    cy.reload();

    cy.get("html").should("have.attr", "data-theme", "dark");
  });

  it("muda os Design Tokens de cor ao trocar de tema", () => {
    cy.get("body").then(($body) => {
      const lightBackground = getComputedStyle($body[0]).backgroundColor;

      cy.setTheme("dark");

      cy.get("body").should(($darkBody) => {
        expect(getComputedStyle($darkBody[0]).backgroundColor).not.to.eq(lightBackground);
      });
    });
  });

  (["light", "dark"] as const).forEach((theme) => {
    it(`mantém contraste legível (WCAG AA) no tema ${theme}`, () => {
      cy.setTheme(theme);

      assertReadable("body");
      assertReadable("[data-cy=lot-card] h3");
      assertReadable("[data-cy=card-current-bid]");
      assertReadable("[data-cy=btn-open-lot]");
      assertReadable("[data-cy=btn-login]");
    });
  });
});
