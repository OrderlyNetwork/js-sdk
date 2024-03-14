/// <reference types="cypress" />

describe("template spec", () => {
  beforeEach(() => {
    cy.visit(
      "/iframe.html?globals=theme:orderly&id=block-tp-sl-form--default&viewMode=story"
    );
  });

  it("input tp price", () => {
    cy.get("[data-testid=tp-price]").type(`123.23`);
    cy.get("[data-testid=tp-price]").should("have.value", "123.23");

    // sl price
    cy.get("[data-testid=sl-price]").type(`123.23`);
    cy.get("[data-testid=sl-price]").should("have.value", "123.23");
  });
});
