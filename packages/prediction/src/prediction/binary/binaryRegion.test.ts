import assert from "node:assert/strict";
import test from "node:test";
import {
  isBinaryRegionRestricted,
  type ProductRestrictedAreasBinaryResponse,
} from "./binaryRegion";

const areas: ProductRestrictedAreasBinaryResponse = {
  product_type: "BINARY",
  countries: { rows: [] },
  cities: { rows: [] },
};

for (const visibility of ["visible", "hidden"] as const) {
  test(`${visibility} country rows restrict trading`, () => {
    const restricted = {
      ...areas,
      countries: { rows: [{ name: "United States", visibility }] },
    };
    assert.equal(
      isBinaryRegionRestricted(restricted, { region: "UNITED_STATES" }),
      true,
    );
    assert.equal(
      isBinaryRegionRestricted(restricted, { country: "united-states" }),
      true,
    );
    assert.equal(
      isBinaryRegionRestricted(restricted, { region: "Canada" }),
      false,
    );
  });

  test(`${visibility} city rows require the matching country`, () => {
    const restricted = {
      ...areas,
      cities: {
        rows: [{ name: "London", country_name: "United Kingdom", visibility }],
      },
    };
    assert.equal(
      isBinaryRegionRestricted(restricted, {
        region: "United Kingdom",
        city: "LONDON",
      }),
      true,
    );
    assert.equal(
      isBinaryRegionRestricted(restricted, {
        region: "Canada",
        city: "London",
      }),
      false,
    );
    assert.equal(
      isBinaryRegionRestricted(restricted, { city: "London" }),
      false,
    );
    assert.equal(
      isBinaryRegionRestricted(restricted, { region: "United Kingdom" }),
      false,
    );
  });
}

test("an unmatched city still checks country restrictions", () => {
  assert.equal(
    isBinaryRegionRestricted(
      {
        ...areas,
        cities: {
          rows: [
            { name: "London", country_name: "Canada", visibility: "hidden" },
          ],
        },
        countries: {
          rows: [{ name: "United Kingdom", visibility: "visible" }],
        },
      },
      { region: "United Kingdom", city: "London" },
    ),
    true,
  );
});

test("missing data and an empty list do not restrict trading", () => {
  assert.equal(
    isBinaryRegionRestricted(undefined, { region: "Canada" }),
    false,
  );
  assert.equal(isBinaryRegionRestricted(areas), false);
  assert.equal(isBinaryRegionRestricted(areas, { region: "Canada" }), false);
});
