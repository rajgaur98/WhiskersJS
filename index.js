const paramChars = "[a-zA-Z0-9_-]+";

const regex = new RegExp(
  `<<(?<param>${paramChars})>>|` +
    `<<#(?<list>${paramChars})>>(?<listBody>(?:.|\\r|\\n)*?)<</\\k<list>>>|` +
    `<<\\?(?<condition>${paramChars})>>(?<trueBody>(?:.|\\r|\\n)*?)(<<!\\k<condition>>>(?<falseBody>(?:.|\\r|\\n)*?))?<</\\k<condition>>>`
);

function handleList(inputStr, params, match) {
  // Create an empty string to hold the result
  let result = "";

  // Check if the list variable exists in the params object
  if (params[match.groups.list]) {
    // If it does, iterate over each item in the list using the map function
    result = params[match.groups.list]
      .map((item) => {
        // Merge the current item's properties into a new params object
        const newParams = { ...params, ...item };

        // Extract the current item's template from the list body
        const itemTemplate = match.groups.listBody;

        // Call Whiskers with the current item's template and the new params object
        const itemResult = Whiskers(itemTemplate, newParams);

        // Return the result of calling Whiskers for this item
        return itemResult;
      })
      .join(""); // Join the resulting array of template strings into a single string
  }

  // Extract the portion of the input string that comes before the list
  const beforeList = inputStr.substring(0, match.index);

  // Extract the portion of the input string that comes after the list
  const afterList = inputStr.substring(match.index + match[0].length);

  // Call Whiskers on the portion of the input string after the list
  const afterListResult = Whiskers(afterList, params);

  // Concatenate the beforeList, the result of the list, and the afterListResult
  const finalResult = beforeList + result + afterListResult;

  // Return the final concatenated string
  return finalResult;
}

function handleConditional(inputStr, params, match) {
  let result = ""; // Initialize the result string

  // Check if the conditional expression is true based on the parameter value
  if (params[match.groups.condition]) {
    // If it's true and there's a true body, evaluate the true body
    if (match.groups.trueBody) {
      result = Whiskers(
        match.groups.trueBody, // Use the true body as the input string
        params // Pass in the parameters object
      );
    }
  } else {
    // If it's false and there's a false body, evaluate the false body
    if (match.groups.falseBody) {
      result = Whiskers(
        match.groups.falseBody, // Use the false body as the input string
        params // Pass in the parameters object
      );
    }
  }

  // Return the input string with the evaluated result string
  return (
    inputStr.substring(0, match.index) + // Add the characters before the match
    result + // Add the evaluated result string
    Whiskers(inputStr.substring(match.index + match[0].length), params) // Evaluate the rest of the input string after the match recursively
  );
}

function handleVariable(inputStr, params, match) {
  // Extract the part of the input string before the matched variable
  const beforeMatch = inputStr.substring(0, match.index);

  // Extract the name of the variable from the named capturing group
  const variableName = match.groups.param;

  // Look up the value of the variable in the params object
  const variableValue = params[variableName];

  // Extract the part of the input string after the matched variable
  const afterMatch = inputStr.substring(match.index + match[0].length);

  // Recursively call the Whiskers function on the remaining input string
  const remainingString = Whiskers(afterMatch, params);

  // Concatenate the parts of the input string with the variable value
  const outputStr = beforeMatch + variableValue + remainingString;

  // Return the updated input string
  return outputStr;
}

function Whiskers(inputStr = "", params = {}) {
  const match = inputStr.match(regex);

  if (!match) return inputStr;

  if (match[0].startsWith("<<#")) {
    return handleList(inputStr, params, match);
  }

  if (match[0].startsWith("<<?")) {
    return handleConditional(inputStr, params, match);
  }

  return handleVariable(inputStr, params, match);
}

console.log(
  Whiskers("<<?param>>This is true<<!param>>This is false<</param>>", {
    param: true,
  })
);

console.log(
  Whiskers("<<?param>>This is true<<!param>>This is false<</param>>", {
    param: false,
  })
);

console.log(
  Whiskers("<<#list>><<item>>-<</list>>", {
    list: [{ item: "item1" }, { item: "item2" }],
  })
);

console.log(
  Whiskers("<<#list>><<#sublist>><<item>>-<</sublist>><</list>>", {
    list: [
      { sublist: [{ item: "item1" }, { item: "item2" }] },
      { sublist: [{ item: "item3" }, { item: "item4" }] },
    ],
  })
);

console.log(
  Whiskers(
    "Hello, <<?showName>><<name>>!<</showName>><<#list>>- <<item>> <</list>>",
    {
      showName: true,
      name: "Alice",
      list: [{ item: "item1" }, { item: "item2" }],
    }
  )
);

console.log(
  Whiskers(
    `<html>
<head>
  <title><<title>></title>
</head>
<body>
  <<#content>>
    <div>
      <h1><<title>></h1>
      <p><<description>></p>
    </div>
  <</content>>
</body>
</html>`,
    {
      title: "My Page Title",
      content: [
        {
          title: "My Content Title",
          description: "This is my content description.",
        },
      ],
    }
  )
);

console.log(
  Whiskers(
    `
<ul>
  <<#items>>
    <li><<name>></li>
  <</items>>
</ul>
`,
    {
      items: [{ name: "Item 1" }, { name: "Item 2" }, { name: "Item 3" }],
    }
  )
);

console.log(
  Whiskers(
    `
<div>
  <<?showHeader>>
    <h1><<headerText>></h1>
  <</showHeader>>
  <p><<content>></p>
</div>
`,
    {
      showHeader: true,
      headerText: "Welcome to my site!",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    }
  )
);

console.log(
  Whiskers(
    `<<?show_users>>
    <h1>Users</h1>
    <ul>
      <<#users>>
        <li><<<name>>></li>
      <</users>>
    </ul>
  <</show_users>>`,
    {
      show_users: true,
      users: undefined,
    }
  )
);
