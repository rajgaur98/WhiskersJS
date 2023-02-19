# WhiskersJS

Minimal and tiny implementation of a template engine in JavaScript

## Usage

- <\<param>> for a single named parameter
- <<#param>>...<<\/param>> for iterating over lists
- <<?param>>...<<!param>>...<<\/param>> for conditionals

### Examples

```
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

// output
<html>
<head>
  <title>My Page Title</title>
</head>
<body>

    <div>
      <h1>My Content Title</h1>
      <p>This is my content description.</p>
    </div>

</body>
</html>
```

```
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

// output
<div>

    <h1>Welcome to my site!</h1>

  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</div>
```

## Useful Links

- Read more at https://sliceofdev.com/posts/template-engine-in-javascript

- View live demo: https://codepen.io/rajgaur98/pen/yLxYxdY
