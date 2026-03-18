import type { ComponentType } from "./dsl-schema";

export interface DslPropertyReference {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

export interface DslComponentReference {
  type: ComponentType;
  description: string;
  props: DslPropertyReference[];
  example: string;
  notes?: string[];
}

export const DSL_CORE_RULES = [
  "El documento siempre empieza con `root`.",
  "Cada nodo usa `type`, `props` y opcionalmente `children`.",
  "El DSL es estricto y determinista: no escribas texto libre esperando que la app lo interprete.",
  "Si un componente no soporta `children`, debes modelar el layout con `row`, `column`, `grid` o `card`.",
  "Para navegación compleja usa `menu` con `groups` e `items` explícitos.",
  "Puedes usar `link` en elementos interactivos para abrir una URL web o un template guardado por nombre.",
  "Los nombres de templates deben ser únicos. Guardar con el mismo nombre actualiza el template actual; un nombre repetido en otro template se rechaza.",
];

export const DSL_QUICKSTART_EXAMPLE = `root:
  type: window
  props:
    title: Admin Dashboard
  children:
    - type: row
      children:
        - type: menu
          props:
            groups:
              - items:
                  - label: Dashboard
                    icon: dashboard
                    active: true
                  - label: Users
                    icon: users
                    badge: 12
        - type: column
          children:
            - type: card
              props:
                title: Total de business
              children:
                - type: text
                  props:
                    content: "128"`;

export const MENU_PROMPT_GUIDE = `Cuando le pidas a una IA que construya un menú, dile explícitamente:
- que use el componente \`menu\`
- si tendrá \`groups\` o una sola lista de \`items\`
- cuál item está \`active: true\`
- qué items llevan \`badge\`
- qué iconos quieres usar: home, dashboard, business, users, category, templates, tickets, features, products, orders, calendar, hr
- si algún item debe usar \`link\` para abrir una web o un template guardado por nombre`;

export const DSL_INTERACTION_GUIDE = [
  {
    title: "Links",
    description: "Si `link` empieza con `http://` o `https://`, abre una página web en una pestaña nueva. Si `link` contiene un nombre como `CRM Dashboard`, intenta abrir el template guardado con ese nombre.",
    example: `- type: button
  props:
    text: Open Tickets
    link: "https://example.com/tickets"

- type: card
  props:
    title: Open CRM
    link: "CRM Dashboard"
  children:
    - type: text
      props:
        content: Click to open the saved template named CRM Dashboard`,
  },
  {
    title: "Tabs interactivos",
    description: "Las tabs del preview ahora son clickeables. Si defines tres labels en `tabs` y tres `children`, cada click cambia el panel activo y lo mantiene visible.",
    example: `- type: tabs
  props:
    tabs:
      - Profile
      - Preferences
      - Access
  children:
    - type: column
      children:
        - type: text
          props:
            content: Profile content
    - type: column
      children:
        - type: text
          props:
            content: Preferences content
    - type: column
      children:
        - type: text
          props:
            content: Access content`,
  },
  {
    title: "Templates por nombre",
    description: "El nombre del template actual aparece arriba a la izquierda. `Save` o `Cmd+S` guarda el template actual. Si el nombre cambia, el `id` cambia al slug del nombre. No se permiten duplicados.",
    example: `Nombre visible en la barra:
Admin Dashboard

Resultado del id:
admin-dashboard`,
  },
];

export const DSL_COMPONENT_REFERENCE: DslComponentReference[] = [
  {
    type: "window",
    description: "Contenedor raíz del documento. Normalmente representa la pantalla completa.",
    props: [
      { name: "title", type: "string", description: "Título mostrado en la parte superior de la ventana." },
      { name: "link", type: "string", description: "Opcional. URL web o nombre de template a abrir al hacer click." },
    ],
    example: `- type: window
  props:
    title: Admin Dashboard`,
    notes: ["Suele contener filas, columnas, cards, tablas o menús."],
  },
  {
    type: "row",
    description: "Layout horizontal para poner varios elementos uno al lado del otro.",
    props: [
      { name: "link", type: "string", description: "Opcional. Hace clickeable toda la fila." },
    ],
    example: `- type: row
  children:
    - type: card
      props:
        title: A
    - type: card
      props:
        title: B`,
  },
  {
    type: "column",
    description: "Layout vertical para apilar elementos.",
    props: [
      { name: "link", type: "string", description: "Opcional. Hace clickeable toda la columna." },
    ],
    example: `- type: column
  children:
    - type: text
      props:
        content: Top
    - type: text
      props:
        content: Bottom`,
  },
  {
    type: "grid",
    description: "Layout de cuadrícula para estadísticas o listados de cards.",
    props: [
      { name: "columns", type: "number", required: true, description: "Cantidad de columnas." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable toda la grilla." },
    ],
    example: `- type: grid
  props:
    columns: 3
  children:
    - type: card
      props:
        title: Metric 1`,
  },
  {
    type: "menu",
    description: "Menú lateral o vertical con grupos, estados activos y badges numéricos.",
    props: [
      { name: "groups", type: "array", description: "Lista de grupos. Cada grupo puede tener `title` e `items`." },
      { name: "items", type: "array", description: "Lista simple de items si no quieres grupos." },
      { name: "group.title", type: "string", description: "Título opcional del grupo." },
      { name: "group.items", type: "array", required: true, description: "Items del grupo." },
      { name: "item.label", type: "string", required: true, description: "Texto visible del item." },
      { name: "item.icon", type: "string", description: "Nombre del icono. Ejemplos: `dashboard`, `users`, `tickets`." },
      { name: "item.active", type: "boolean", description: "Marca el item seleccionado." },
      { name: "item.badge", type: "string | number", description: "Badge numérico o texto corto." },
      { name: "item.link", type: "string", description: "URL web o nombre de template a abrir al hacer click." },
    ],
    example: `- type: menu
  props:
    groups:
      - items:
          - label: Dashboard
            icon: dashboard
            active: true
      - title: Shop
        items:
          - label: Orders
            icon: orders
            badge: 169`,
    notes: ["Ideal para generar sidebars a través de IA.", "Solo un item debería ir activo por sección o por menú."],
  },
  {
    type: "table",
    description: "Tabla para datos tabulares.",
    props: [
      { name: "columns", type: "string[]", required: true, description: "Headers de la tabla." },
      { name: "rows", type: "array[]", required: true, description: "Filas de datos." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable la tabla completa." },
    ],
    example: `- type: table
  props:
    columns: [ID, Name, Status]
    rows:
      - [001, Acme, Active]`,
  },
  {
    type: "input",
    description: "Campo de entrada de texto.",
    props: [
      { name: "placeholder", type: "string", description: "Placeholder del campo." },
      { name: "inputType", type: "string", description: "Tipo HTML: text, email, password, tel..." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable el input para navegar." },
    ],
    example: `- type: input
  props:
    placeholder: you@example.com
    inputType: email`,
  },
  {
    type: "textarea",
    description: "Campo multilinea.",
    props: [
      { name: "placeholder", type: "string", description: "Texto guía." },
      { name: "rows", type: "number", description: "Cantidad de filas visibles." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable el textarea para navegar." },
    ],
    example: `- type: textarea
  props:
    placeholder: Describe the issue
    rows: 4`,
  },
  {
    type: "select",
    description: "Selector con opciones predefinidas.",
    props: [
      { name: "options", type: "string[]", required: true, description: "Opciones disponibles." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable el select para navegar." },
    ],
    example: `- type: select
  props:
    options:
      - Admin
      - Editor
      - Viewer`,
  },
  {
    type: "checkbox",
    description: "Checkbox simple con label.",
    props: [
      { name: "label", type: "string", required: true, description: "Texto del checkbox." },
      { name: "checked", type: "boolean", description: "Estado visual inicial." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable el checkbox para navegar." },
    ],
    example: `- type: checkbox
  props:
    label: Enable notifications
    checked: true`,
  },
  {
    type: "button",
    description: "Botón de acción.",
    props: [
      { name: "text", type: "string", required: true, description: "Texto del botón." },
      { name: "variant", type: "string", description: "Visual principal o secundario. Usa `primary` para destacar." },
      { name: "link", type: "string", description: "Opcional. URL web o nombre de template a abrir al hacer click." },
    ],
    example: `- type: button
  props:
    text: Save changes
    variant: primary`,
  },
  {
    type: "label",
    description: "Etiqueta de formulario o texto corto.",
    props: [
      { name: "text", type: "string", required: true, description: "Texto visible." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable el label." },
    ],
    example: `- type: label
  props:
    text: Email`,
  },
  {
    type: "text",
    description: "Texto descriptivo o de apoyo.",
    props: [
      { name: "content", type: "string", required: true, description: "Contenido del párrafo." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable el texto." },
    ],
    example: `- type: text
  props:
    content: Total de shoppers`,
  },
  {
    type: "modal",
    description: "Contenedor modal para confirmaciones o formularios secundarios.",
    props: [
      { name: "title", type: "string", description: "Título del modal." },
      { name: "open", type: "boolean", description: "Estado visual. La implementación actual lo muestra como preview." },
      { name: "link", type: "string", description: "Opcional. Hace clickeable el modal completo." },
    ],
    example: `- type: modal
  props:
    title: Confirm Delete
    open: true
  children:
    - type: text
      props:
        content: Are you sure?`,
  },
  {
    type: "card",
    description: "Caja visual para agrupar contenido relacionado.",
    props: [
      { name: "title", type: "string", description: "Título de la card." },
      { name: "link", type: "string", description: "Opcional. URL web o nombre de template a abrir al hacer click." },
    ],
    example: `- type: card
  props:
    title: Total de business
  children:
    - type: text
      props:
        content: "128"`,
  },
  {
    type: "tabs",
    description: "Agrupa vistas relacionadas bajo pestañas.",
    props: [
      { name: "tabs", type: "string[]", required: true, description: "Etiquetas de las tabs." },
    ],
    example: `- type: tabs
  props:
    tabs:
      - Overview
      - Settings
  children:
    - type: column
      children:
        - type: text
          props:
            content: Overview content`,
    notes: ["Las tabs del preview son clickeables y cambian el panel activo."],
  },
];
