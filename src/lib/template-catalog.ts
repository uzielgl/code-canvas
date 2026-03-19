import type { ComponentType, DslNode, DslRoot } from "./dsl-schema";

export interface BuiltInExample {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  document: DslRoot;
}

const node = (type: ComponentType, props?: Record<string, unknown>, children?: DslNode[]): DslNode => ({
  type,
  ...(props && Object.keys(props).length > 0 ? { props } : {}),
  ...(children && children.length > 0 ? { children } : {}),
});

const win = (title: string, children: DslNode[]): DslRoot => ({
  root: node("window", { title }, children),
});

const row = (...children: DslNode[]) => node("row", undefined, children);
const column = (...children: DslNode[]) => node("column", undefined, children);
const grid = (columns: number, ...children: DslNode[]) => node("grid", { columns }, children);
const menu = (groups: Array<{ title?: string; items: Array<Record<string, unknown>> }>) => node("menu", { groups });
const templates = (name: string, active?: string) => node("templates", { name, ...(active ? { active } : {}) });
const card = (title: string, ...children: DslNode[]) => node("card", { title }, children);
const tabs = (labels: string[], ...children: DslNode[]) => node("tabs", { tabs: labels }, children);
const modal = (title: string, ...children: DslNode[]) => node("modal", { title, open: true }, children);
const text = (content: string) => node("text", { content });
const label = (labelText: string) => node("label", { text: labelText });
const input = (placeholder: string, inputType = "text") => node("input", { placeholder, inputType });
const textarea = (placeholder: string, rows = 3) => node("textarea", { placeholder, rows });
const select = (options: string[]) => node("select", { options });
const checkbox = (checkboxLabel: string, checked = false) => node("checkbox", { label: checkboxLabel, checked });
const button = (buttonText: string, variant: "primary" | "secondary" = "secondary") =>
  node("button", { text: buttonText, variant });
const table = (columns: string[], rows: Array<Array<string | number>>) => node("table", { columns, rows });

export const DEFAULT_EXAMPLE_ID = "workspace-starter";

export const BUILT_IN_EXAMPLES: BuiltInExample[] = [
  {
    id: "layout-menu",
    name: "layout.menu",
    description: "Reusable menu layout to include via `templates`.",
    category: "Layouts",
    tags: ["templates", "menu", "layout"],
    document: {
      root: menu([
        {
          items: [
            { label: "Dashboard", icon: "dashboard", active: true },
          ],
        },
        {
          title: "Gestión",
          items: [
            { label: "Businesses", icon: "business", link: "Businesses" },
            { label: "Usuarios", icon: "users", link: "Usuarios" },
            { label: "Templates", icon: "templates", link: "Templates" },
            { label: "Categorías", icon: "category", link: "Categorias" },
            { label: "Features", icon: "products", link: "Features" },
            { label: "Planes", icon: "orders", link: "Planes" },
            { label: "Media", icon: "templates", link: "Media" },
          ],
        },
        {
          title: "Contenido",
          items: [
            { label: "CMS / Views", icon: "templates", link: "Views" },
            { label: "Soporte", icon: "tickets", badge: 7, link: "Soporte" },
          ],
        },
        {
          title: "Sistema",
          items: [
            { label: "Dominios", icon: "dashboard", link: "Dominios" },
            { label: "Comisiones", icon: "orders", link: "Comisiones" },
          ],
        },
      ]),
    },
  },
  {
    id: "admin-dashboard-invitaciones",
    name: "Admin Dashboard — Invitaciones Digitales",
    description: "Dashboard example that reuses the shared `layout.menu` template.",
    category: "Layouts",
    tags: ["dashboard", "templates", "menu"],
    document: {
      root: node("window", { title: "Admin Dashboard — Invitaciones Digitales" }, [
        row(
          templates("layout.menu", "Dashboard"),
          column(
            grid(
              3,
              card("Total businesses", text("48")),
              card("Invitaciones creadas", text("1,284")),
              card("Total invitados", text("32,450")),
              card("Eventos activos", text("214")),
              card("Storage usado", text("38.4 GB / 100 GB")),
              card("Usuarios totales", text("312")),
            ),
            row(
              card(
                "Actividad reciente",
                table(
                  ["Evento", "Detalle", "Hace"],
                  [
                    ["Nuevo business", "Boda de Ana & Luis", "12 min"],
                    ["Template creado", "Quinceañera Elegante", "1 hora"],
                    ["Business suspendido", "Invitaciones Pérez", "2 horas"],
                    ["Ticket abierto", "Problema con dominio", "3 horas"],
                    ["Dominio verificado", "invitacionesdepepito.com", "5 horas"],
                  ],
                ),
              ),
              card(
                "Estado del sistema",
                table(
                  ["Módulo", "Estado", "Valor"],
                  [
                    ["Businesses activos", "Activo", "44 / 48"],
                    ["Businesses suspendidos", "Alerta", "4"],
                    ["Tickets abiertos", "Pendiente", "7"],
                    ["Dominios verificados", "Activo", "31 / 35"],
                    ["Templates activos", "Activo", "28"],
                    ["Storage", "Info", "38%"],
                  ],
                ),
              ),
            ),
          ),
        ),
      ]),
    },
  },
  {
    id: "grouped-admin-menu",
    name: "Grouped Admin Menu",
    description: "Vertical grouped navigation with active state, icons, and numeric badges.",
    category: "Index",
    tags: ["menu", "navigation", "badges"],
    document: win(
      "Admin Navigation",
      [
        row(
          menu([
            {
              items: [
                { label: "Welcome", icon: "home", active: true },
                { label: "Shop Dashboard", icon: "dashboard" },
                { label: "HR Dashboard", icon: "hr" },
              ],
            },
            {
              title: "Shop",
              items: [
                { label: "Products", icon: "products", badge: 3 },
                { label: "Orders", icon: "orders", badge: 169 },
                { label: "Customers", icon: "users" },
                { label: "Brands", icon: "handbook" },
                { label: "Product Categories", icon: "category" },
              ],
            },
            {
              title: "HR",
              items: [
                { label: "Employees", icon: "user" },
                { label: "Departments", icon: "business" },
                { label: "Leave Requests", icon: "calendar", badge: 70 },
                { label: "Expenses", icon: "tickets", badge: 70 },
              ],
            },
          ]),
          column(
            card(
              "Overview",
              text("Use the menu component for deterministic, grouped application navigation."),
              row(
                card("Active Workspace", text("Welcome")),
                card("Open Orders", text("169")),
                card("Pending Leave Requests", text("70")),
              ),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "workspace-starter",
    name: "Workspace Starter",
    description: "A balanced starter layout with forms, settings, and preview-friendly structure.",
    category: "Starters",
    tags: ["starter", "dashboard", "settings"],
    document: win(
      "Workspace Starter",
      [
        row(
          column(
            card(
              "Sign In",
              label("Email"),
              input("you@example.com", "email"),
              label("Password"),
              input("••••••••", "password"),
              row(
                checkbox("Remember me", true),
                button("Continue", "primary"),
              ),
            ),
          ),
          column(
            card(
              "Workspace Settings",
              tabs(
                ["Profile", "Preferences", "Access"],
                column(
                  label("Display name"),
                  input("Nadia Torres"),
                  label("Bio"),
                  textarea("Tell collaborators how you work"),
                  label("Default theme"),
                  select(["Light", "Dark", "System"]),
                  checkbox("Enable desktop alerts", true),
                  button("Save changes", "primary"),
                ),
                column(
                  label("Language"),
                  select(["English", "Español", "Português"]),
                  checkbox("Compact density", false),
                ),
                column(
                  label("Role"),
                  select(["Owner", "Editor", "Viewer"]),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "component-atlas",
    name: "Component Atlas",
    description: "An index example that touches every supported component in a single deterministic document.",
    category: "Index",
    tags: ["atlas", "all-components", "reference"],
    document: win(
      "Component Atlas",
      [
        row(
          column(
            card(
              "Form Controls",
              label("Email"),
              input("designer@company.com", "email"),
              label("Project brief"),
              textarea("Outline the goals, constraints, and launch date", 4),
              label("Role"),
              select(["Designer", "Engineer", "Stakeholder"]),
              checkbox("Subscribe to updates", true),
              row(
                button("Cancel"),
                button("Create workspace", "primary"),
              ),
            ),
            card(
              "Text Elements",
              text("Use labels, helper copy, and buttons to compose low-fidelity user flows."),
              text("The DSL stays structured and deterministic."),
            ),
          ),
          column(
            card(
              "Layout Blocks",
              grid(
                2,
                card("Card A", text("Cards can live inside rows, columns, and grids.")),
                card("Card B", text("Grids define predictable repeated layouts.")),
                card("Card C", text("Combine layout primitives for dashboards.")),
                card("Card D", text("Keep props explicit, never inferred.")),
              ),
            ),
            card(
              "Table Preview",
              table(
                ["ID", "Owner", "Status", "Next Step"],
                [
                  ["OPS-001", "Ana", "Open", "Triage"],
                  ["OPS-002", "Luis", "In Progress", "Review"],
                  ["OPS-003", "Mara", "Done", "Archive"],
                ],
              ),
            ),
            card(
              "Tabs And Modal",
              tabs(
                ["Overview", "Timeline", "Audit"],
                column(
                  text("Tabs define grouped views."),
                  modal(
                    "Archive Confirmation",
                    text("Are you sure you want to archive this workspace?"),
                    row(
                      button("Keep open"),
                      button("Archive now", "primary"),
                    ),
                  ),
                ),
                column(text("Timeline panel")),
                column(text("Audit panel")),
              ),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "login-form",
    name: "Login Form",
    description: "Compact auth screen with two actions and a recovery hint.",
    category: "Forms",
    tags: ["auth", "login", "form"],
    document: win(
      "Sign In",
      [
        card(
          "Welcome back",
          text("Access your workspace with your corporate account."),
          label("Email"),
          input("you@company.com", "email"),
          label("Password"),
          input("••••••••", "password"),
          row(
            checkbox("Keep me signed in", true),
            text("Forgot password?"),
          ),
          row(
            button("Cancel"),
            button("Log in", "primary"),
          ),
        ),
      ],
    ),
  },
  {
    id: "registration-flow",
    name: "Registration Flow",
    description: "A multi-field registration screen combining grid layout and consent controls.",
    category: "Forms",
    tags: ["signup", "registration", "grid"],
    document: win(
      "Create Account",
      [
        card(
          "Team Registration",
          grid(
            2,
            column(label("First name"), input("Nadia")),
            column(label("Last name"), input("Torres")),
            column(label("Work email"), input("nadia@company.com", "email")),
            column(label("Phone"), input("+52 55 5555 5555", "tel")),
          ),
          label("Organization"),
          input("Northwind Labs"),
          label("What are you building?"),
          textarea("Describe the workflow you want to wireframe", 4),
          row(
            checkbox("I accept the terms", true),
            checkbox("Send onboarding material", false),
          ),
          row(
            button("Save draft"),
            button("Create account", "primary"),
          ),
        ),
      ],
    ),
  },
  {
    id: "profile-settings",
    name: "Profile Settings",
    description: "Settings workspace using tabs to split profile, notifications, and appearance.",
    category: "Forms",
    tags: ["settings", "profile", "tabs"],
    document: win(
      "Profile Settings",
      [
        card(
          "Workspace Preferences",
          tabs(
            ["Profile", "Notifications", "Appearance"],
            column(
              label("Display name"),
              input("Nadia Torres"),
              label("Role headline"),
              input("Product Designer"),
              label("About"),
              textarea("Working on internal product systems and wireframe operations", 4),
              button("Update profile", "primary"),
            ),
            column(
              checkbox("Email me when a review is requested", true),
              checkbox("Daily summary digest", true),
              checkbox("Mention alerts", true),
              button("Save notifications", "primary"),
            ),
            column(
              label("Theme"),
              select(["Light", "Dark", "System"]),
              label("Density"),
              select(["Comfortable", "Compact"]),
              button("Apply appearance", "primary"),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "contact-center",
    name: "Contact Center",
    description: "Two-column support intake view with a request form and summary panel.",
    category: "Forms",
    tags: ["contact", "support", "two-column"],
    document: win(
      "Contact Center",
      [
        row(
          column(
            card(
              "Submit Request",
              label("Full name"),
              input("Jordan Lee"),
              label("Email"),
              input("jordan@client.com", "email"),
              label("Priority"),
              select(["Low", "Normal", "High", "Critical"]),
              label("Message"),
              textarea("Explain the issue, expected outcome, and deadline", 5),
              row(
                checkbox("Include account context", true),
                button("Send request", "primary"),
              ),
            ),
          ),
          column(
            card(
              "Routing Summary",
              text("Incoming requests are routed to the operations desk in under five minutes."),
              table(
                ["Queue", "Owner", "SLA"],
                [
                  ["Billing", "Andrea", "2h"],
                  ["Technical", "Pablo", "30m"],
                  ["General", "Maya", "4h"],
                ],
              ),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    description: "Metrics overview mixing cards, grid layout, filters, and a reporting table.",
    category: "Layouts",
    tags: ["analytics", "dashboard", "table"],
    document: win(
      "Analytics Dashboard",
      [
        row(
          input("Search dashboard"),
          select(["This week", "This month", "This quarter"]),
          button("Refresh", "primary"),
        ),
        grid(
          4,
          card("Revenue", text("$124,000"), text("+12% vs prior period")),
          card("Conversion", text("4.8%"), text("+0.7 pts")),
          card("Open Tickets", text("18"), text("-4 today")),
          card("Deployments", text("7"), text("2 pending review")),
        ),
        row(
          column(
            card(
              "Pipeline",
              table(
                ["Stage", "Deals", "Value"],
                [
                  ["Qualified", 18, "$64k"],
                  ["Proposal", 9, "$41k"],
                  ["Negotiation", 4, "$19k"],
                ],
              ),
            ),
          ),
          column(
            card(
              "Team Notes",
              text("Keep summaries short and focused on explicit metrics."),
              text("Use cards for status and tables for dense operational details."),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "data-table-crud",
    name: "Data Table CRUD",
    description: "Records management view with filters, bulk actions, a table, and a modal.",
    category: "Layouts",
    tags: ["crud", "table", "records"],
    document: win(
      "Customer Records",
      [
        row(
          input("Search by customer or company"),
          select(["All statuses", "Active", "Paused", "Archived"]),
          button("Add customer", "primary"),
        ),
        table(
          ["ID", "Customer", "Plan", "Status", "Owner"],
          [
            ["CUS-001", "Altair Group", "Enterprise", "Active", "Mara"],
            ["CUS-002", "Nova Retail", "Growth", "Paused", "Luis"],
            ["CUS-003", "Pine Labs", "Starter", "Active", "Jade"],
            ["CUS-004", "Solstice Bank", "Enterprise", "Archived", "Noah"],
          ],
        ),
        modal(
          "Create Customer",
          label("Company"),
          input("Acme Corp"),
          label("Plan"),
          select(["Starter", "Growth", "Enterprise"]),
          row(
            button("Cancel"),
            button("Create", "primary"),
          ),
        ),
      ],
    ),
  },
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Catalog-style layout using filters, grid cards, and clear purchase actions.",
    category: "Layouts",
    tags: ["ecommerce", "catalog", "grid"],
    document: win(
      "Product Showcase",
      [
        row(
          input("Search products"),
          select(["All categories", "Accessories", "Workspace", "Audio"]),
          select(["Sort: Featured", "Sort: Price", "Sort: Newest"]),
        ),
        grid(
          3,
          card("Desk Lamp", text("Minimal metal lamp for focused work."), button("Add to cart", "primary")),
          card("Standing Desk", text("Height-adjustable desk with cable tray."), button("Configure", "primary")),
          card("Studio Headphones", text("Closed-back headphones for editing sessions."), button("Add to cart", "primary")),
          card("Notebook Set", text("Grid paper notebooks in three sizes."), button("View details", "primary")),
          card("Monitor Arm", text("Dual-arm setup for compact desks."), button("Configure", "primary")),
          card("Keyboard", text("Mechanical keyboard with tactile switches."), button("Add to cart", "primary")),
        ),
      ],
    ),
  },
  {
    id: "kanban-board",
    name: "Kanban Board",
    description: "Board layout built from rows, columns, and cards to model work states.",
    category: "Layouts",
    tags: ["kanban", "project", "board"],
    document: win(
      "Sprint Board",
      [
        row(
          column(
            card("Backlog", text("Refine API contracts"), text("Document examples catalog"), text("Prep onboarding copy")),
          ),
          column(
            card("In Progress", text("Implement template CRUD"), text("Support JSON mode"), button("Add task", "primary")),
          ),
          column(
            card("Review", text("Verify validation states"), text("Check docs alignment")),
          ),
          column(
            card("Done", text("Set up split-screen editor"), text("Wireframe and UI preview modes")),
          ),
        ),
      ],
    ),
  },
  {
    id: "modal-confirmation",
    name: "Modal Confirmation",
    description: "Simple destructive confirmation flow centered on modal content.",
    category: "Advanced",
    tags: ["modal", "confirmation", "destructive"],
    document: win(
      "Archive Project",
      [
        text("Use explicit confirmation content for risky actions."),
        row(
          button("Back"),
          button("Archive project", "primary"),
        ),
        modal(
          "Archive Confirmation",
          text("This action hides the project from the active workspace and can be reversed later."),
          checkbox("Also notify stakeholders", true),
          row(
            button("Cancel"),
            button("Confirm archive", "primary"),
          ),
        ),
      ],
    ),
  },
  {
    id: "tabbed-workspace",
    name: "Tabbed Workspace",
    description: "A compact workspace showing how tabs can organize related operational views.",
    category: "Advanced",
    tags: ["tabs", "workspace", "operations"],
    document: win(
      "Release Workspace",
      [
        card(
          "Release Control",
          tabs(
            ["Summary", "Checklist", "Timeline"],
            column(
              text("Milestone: Spring launch"),
              table(
                ["Area", "Owner", "Status"],
                [
                  ["QA", "Priya", "Ready"],
                  ["Docs", "Ana", "Editing"],
                  ["Ops", "Mateo", "Queued"],
                ],
              ),
            ),
            column(
              checkbox("QA sign-off", true),
              checkbox("Docs published", false),
              checkbox("Support briefed", false),
            ),
            column(
              text("T-7 days: content lock"),
              text("T-3 days: release candidate"),
              text("Launch day: announce and monitor"),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "onboarding-checklist",
    name: "Onboarding Checklist",
    description: "Structured onboarding plan combining guidance text, forms, and task checkboxes.",
    category: "Advanced",
    tags: ["onboarding", "checklist", "tasks"],
    document: win(
      "New Hire Onboarding",
      [
        row(
          column(
            card(
              "Profile Setup",
              label("Full name"),
              input("Avery Chen"),
              label("Team"),
              select(["Design", "Engineering", "Operations"]),
              label("Start date"),
              input("2026-03-30"),
              button("Save profile", "primary"),
            ),
          ),
          column(
            card(
              "Week 1 Checklist",
              checkbox("Create accounts", true),
              checkbox("Meet the team", false),
              checkbox("Review design system", false),
              checkbox("Finish security training", false),
            ),
            card(
              "Manager Notes",
              textarea("Capture goals, blockers, and follow-up actions", 5),
              button("Share notes", "primary"),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "support-ticket-desk",
    name: "Support Ticket Desk",
    description: "Operational desk showing ticket list, ticket detail, and response actions together.",
    category: "Compositions",
    tags: ["support", "tickets", "operations"],
    document: win(
      "Support Ticket Desk",
      [
        row(
          column(
            row(
              input("Search tickets"),
              select(["All queues", "Billing", "Technical", "Priority"]),
            ),
            table(
              ["Ticket", "Requester", "Priority", "Status"],
              [
                ["TCK-201", "A. Rivera", "High", "Open"],
                ["TCK-202", "M. Souza", "Normal", "Investigating"],
                ["TCK-203", "J. Patel", "Critical", "Escalated"],
              ],
            ),
          ),
          column(
            card(
              "Selected Ticket",
              text("Requester cannot access workspace after SSO update."),
              label("Assignee"),
              select(["Maya", "Pablo", "Andrea"]),
              label("Internal note"),
              textarea("Summarize findings and next steps", 5),
              row(
                button("Save draft"),
                button("Send reply", "primary"),
              ),
            ),
          ),
        ),
      ],
    ),
  },
  {
    id: "admin-control-room",
    name: "Admin Control Room",
    description: "Dense admin surface with filters, monitoring cards, tables, and a coordinated modal.",
    category: "Compositions",
    tags: ["admin", "control-room", "monitoring"],
    document: win(
      "Admin Control Room",
      [
        row(
          input("Search systems, alerts, or users"),
          select(["All regions", "US", "LATAM", "EU"]),
          select(["Severity: All", "Severity: High", "Severity: Critical"]),
          button("Create alert", "primary"),
        ),
        row(
          column(
            grid(
              2,
              card("System Health", text("12 services healthy"), text("1 degraded")),
              card("Approvals", text("4 pending admin approvals"), text("2 over SLA")),
              card("Incidents", text("3 active incidents"), text("1 critical")),
              card("Deploy Queue", text("6 changes queued"), text("2 blocked")),
            ),
            card(
              "Alert Feed",
              table(
                ["Alert", "Service", "Status", "Owner"],
                [
                  ["Latency spike", "edge-api", "Open", "Nora"],
                  ["Disk nearing limit", "reports-db", "Monitoring", "Sam"],
                  ["Webhook retries", "billing-sync", "Open", "Leo"],
                ],
              ),
            ),
          ),
          column(
            card(
              "Runbook Editor",
              label("Runbook title"),
              input("Database saturation response"),
              label("Instructions"),
              textarea("Define immediate actions, escalation path, and rollback checks", 6),
              row(
                checkbox("Mark as default runbook", true),
                button("Publish runbook", "primary"),
              ),
            ),
            modal(
              "Create Alert Rule",
              label("Rule name"),
              input("High latency on edge-api"),
              label("Channel"),
              select(["Pager", "Email", "Slack"]),
              row(
                button("Cancel"),
                button("Create rule", "primary"),
              ),
            ),
          ),
        ),
      ],
    ),
  },
];

export function getBuiltInExampleById(id: string): BuiltInExample | null {
  return BUILT_IN_EXAMPLES.find((example) => example.id === id) ?? null;
}

export function collectComponentTypes(document: DslRoot): ComponentType[] {
  const found = new Set<ComponentType>();

  const visit = (nodeToVisit: DslNode) => {
    found.add(nodeToVisit.type);
    nodeToVisit.children?.forEach(visit);
  };

  visit(document.root);

  return Array.from(found);
}
