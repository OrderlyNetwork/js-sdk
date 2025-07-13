import { MultiTableSort, MultiSortField } from "../type";

/**
 * Performance optimized multi-field sorting utility
 */
export class MultiSortUtils {
  /**
   * Create a stable sorting function for multiple fields
   * @param sort - Multi-table sort configuration
   * @param fieldAccessors - Map of field keys to accessor functions
   * @returns Comparison function for Array.sort()
   */
  static createSortComparator<T>(
    sort: MultiTableSort,
    fieldAccessors: Record<string, (record: T) => any>,
  ) {
    return (a: T, b: T): number => {
      for (const fieldSort of sort.fields) {
        const accessor = fieldAccessors[fieldSort.sortKey];
        if (!accessor) {
          console.warn(`No accessor found for field: ${fieldSort.sortKey}`);
          continue;
        }

        let aValue = accessor(a);
        let bValue = accessor(b);

        // Handle null/undefined values
        if (aValue == null && bValue == null) continue;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Normalize values for comparison
        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        // Compare values
        let comparison = 0;
        if (aValue < bValue) {
          comparison = -1;
        } else if (aValue > bValue) {
          comparison = 1;
        }

        if (comparison !== 0) {
          return fieldSort.sort === "desc" ? -comparison : comparison;
        }
      }
      return 0;
    };
  }

  /**
   * Create field accessor map from MultiSortField array
   * @param fields - Array of multi-sort fields
   * @returns Map of field keys to accessor functions
   */
  static createFieldAccessorMap<T>(fields: MultiSortField[]) {
    const accessorMap: Record<string, (record: T) => any> = {};
    fields.forEach((field) => {
      accessorMap[field.sortKey] = field.accessor;
    });
    return accessorMap;
  }

  /**
   * Debounced sorting to improve performance with frequent updates
   */
  static createDebouncedSort<T>(
    callback: (sortedData: T[]) => void,
    delay: number = 300,
  ) {
    let timeoutId: NodeJS.Timeout;

    return (
      data: T[],
      sort: MultiTableSort | undefined,
      fieldAccessors: Record<string, (record: T) => any>,
    ) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (!sort) {
          callback(data);
          return;
        }

        const sortedData = [...data].sort(
          MultiSortUtils.createSortComparator(sort, fieldAccessors),
        );
        callback(sortedData);
      }, delay);
    };
  }

  /**
   * Validate sort configuration
   */
  static validateSortConfig(
    sort: MultiTableSort,
    availableFields: string[],
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!sort.fields || sort.fields.length === 0) {
      errors.push("No fields specified for sorting");
    }

    sort.fields.forEach((field) => {
      if (!field.sortKey) {
        errors.push("Field sort key is required");
      }
      if (!availableFields.includes(field.sortKey)) {
        errors.push(`Unknown field: ${field.sortKey}`);
      }
      if (!["asc", "desc"].includes(field.sort)) {
        errors.push(`Invalid sort direction: ${field.sort}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert sort configuration to URL search params
   */
  static sortToUrlParams(sort?: MultiTableSort): URLSearchParams {
    const params = new URLSearchParams();

    if (sort && sort.fields.length > 0) {
      const sortString = sort.fields
        .map((field) => `${field.sortKey}:${field.sort}`)
        .join(",");
      params.set("sort", sortString);
    }

    return params;
  }

  /**
   * Parse sort configuration from URL search params
   */
  static sortFromUrlParams(
    params: URLSearchParams,
    columnKey: string,
  ): MultiTableSort | undefined {
    const sortString = params.get("sort");

    if (!sortString) return undefined;

    try {
      const fields = sortString.split(",").map((fieldString) => {
        const [sortKey, sort] = fieldString.split(":");
        return {
          sortKey,
          sort: sort as "asc" | "desc",
        };
      });

      return {
        sortKey: columnKey,
        fields,
      };
    } catch (error) {
      console.warn("Failed to parse sort from URL params:", error);
      return undefined;
    }
  }
}
