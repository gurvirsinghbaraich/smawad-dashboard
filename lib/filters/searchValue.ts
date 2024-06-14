let searchValue = "!:smart";

function parseSearchValue(searchValue: string | null): {
  searchString: string;
  modifiers: string[];
} {
  // Initialize variables to store the parsed search string and modifiers
  let searchString = "";
  const modifiers: string[] = [];

  // Check if searchValue is not null and not empty
  if (searchValue && searchValue.trim().length > 0) {
    // Regular expression to match modifiers and search string
    const regex = /[\^!]?"(?:[^"\\]|\\.)*"|[\^!]?[^:]+/g;

    let match;

    // Iterate over matches in searchValue
    while ((match = regex.exec(searchValue)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // Extract the matched string
      const matchString = match[0];

      // Check if the matched string is a modifier
      if (matchString.startsWith("^") || matchString.startsWith("!")) {
        // Add the modifier to the modifiers array
        modifiers.push(...matchString.split(""));
      } else {
        // Extract the search string and remove any surrounding double quotes
        if (matchString.startsWith('"') && matchString.endsWith('"'))
          modifiers.push("strict-match");

        searchString = matchString.replace(/^"(.*)"$/, "$1");
      }
    }
  }

  // Return the parsed search string and modifiers
  return {
    searchString,
    modifiers,
  };
}

export function filterBySearchValue<TArray extends Array<any>>(
  array: TArray,
  searchValue: string | null,
): TArray {
  // Parse the search value to extract search string and modifiers
  const { searchString, modifiers } = parseSearchValue(searchValue);

  // Check if the search string is empty
  if (!searchString) {
    // If search string is empty, return true to include all items
    return array as TArray;
  }

  let filteredArray: TArray[] = array;

  modifiers.map((modifier) => {
    switch (modifier) {
      case "!": {
        filteredArray = negationModifer(filteredArray, searchString);
        break;
      }

      case "^": {
        filteredArray = caseSensitiveModifier(filteredArray, searchString);
        break;
      }

      case "strict-match": {
        filteredArray = strictMatch(filteredArray, searchString);
        break;
      }
    }
  });

  return modifiers.includes("strict-match") ||
    modifiers.includes("!") ||
    modifiers.includes("^")
    ? (filteredArray as TArray)
    : (filteredArray.filter((o) => searchInObject(o, searchString)) as TArray);
}

function searchInObject(
  obj: any,
  searchValue: string,
  strict = false,
  caseSensitive = false,
): boolean {
  return Object.values(obj).some((value) => {
    if (typeof value === "string") {
      let valueToCheck = value;
      if (!caseSensitive) {
        valueToCheck = valueToCheck.toLowerCase();
        searchValue = searchValue.toLowerCase();
      }
      if (strict) {
        return valueToCheck === searchValue;
      } else {
        return valueToCheck.includes(searchValue);
      }
    }
    if (typeof value === "object" && value !== null) {
      return searchInObject(value, searchValue, strict, caseSensitive);
    }
    return false;
  });
}

function strictMatch<TArray extends Array<any>>(
  array: TArray,
  searchString: string,
): TArray {
  return array.filter((o) =>
    searchInObject(o, searchString, true, false),
  ) as TArray;
}

function caseSensitiveModifier<TArray extends Array<any>>(
  array: TArray,
  searchString: string,
): TArray {
  return array.filter((o) =>
    searchInObject(o, searchString, false, true),
  ) as TArray;
}

function negationModifer<TArray extends Array<any>>(
  array: TArray,
  searchString: string,
): TArray {
  return array.filter(
    (o) => !searchInObject(o, searchString, false, false),
  ) as TArray;
}
