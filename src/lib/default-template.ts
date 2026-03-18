export const DEFAULT_DSL = `root:
  type: window
  props:
    title: My Application
  children:
    - type: row
      children:
        - type: column
          children:
            - type: card
              props:
                title: Login Form
              children:
                - type: label
                  props:
                    text: Email
                - type: input
                  props:
                    placeholder: you@example.com
                - type: label
                  props:
                    text: Password
                - type: input
                  props:
                    placeholder: "••••••••"
                    inputType: password
                - type: row
                  children:
                    - type: checkbox
                      props:
                        label: Remember me
                    - type: button
                      props:
                        text: Sign In
                        variant: primary
        - type: column
          children:
            - type: card
              props:
                title: User Settings
              children:
                - type: tabs
                  props:
                    tabs:
                      - Profile
                      - Preferences
                  children:
                    - type: column
                      children:
                        - type: label
                          props:
                            text: Display Name
                        - type: input
                          props:
                            placeholder: John Doe
                        - type: label
                          props:
                            text: Bio
                        - type: textarea
                          props:
                            placeholder: Tell us about yourself...
                    - type: column
                      children:
                        - type: label
                          props:
                            text: Theme
                        - type: select
                          props:
                            options:
                              - Light
                              - Dark
                              - System
                        - type: checkbox
                          props:
                            label: Enable notifications
                        - type: button
                          props:
                            text: Save Changes
`;

export const TEMPLATES: Record<string, string> = {
  "Login Form": DEFAULT_DSL,
  "Data Table": `root:
  type: window
  props:
    title: Data Dashboard
  children:
    - type: row
      children:
        - type: input
          props:
            placeholder: Search records...
        - type: select
          props:
            options:
              - All
              - Active
              - Archived
        - type: button
          props:
            text: Add Record
            variant: primary
    - type: table
      props:
        columns:
          - ID
          - Name
          - Status
          - Actions
        rows:
          - ["001", "Alpha Project", "Active", "Edit"]
          - ["002", "Beta Launch", "Pending", "Edit"]
          - ["003", "Gamma Test", "Archived", "View"]
`,
  "Modal Dialog": `root:
  type: window
  props:
    title: Modal Example
  children:
    - type: text
      props:
        content: Click the button to imagine a modal appearing.
    - type: modal
      props:
        title: Confirm Action
        open: true
      children:
        - type: text
          props:
            content: Are you sure you want to proceed?
        - type: row
          children:
            - type: button
              props:
                text: Cancel
            - type: button
              props:
                text: Confirm
                variant: primary
`,
};
