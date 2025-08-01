<template>
  <div style="background-color: #1e1e1e; color: #fff; border: 1px solid #444">
    <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor
      style="height: 500px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script>
import "@wangeditor/editor/dist/css/style.css";
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { Boot, i18nChangeLanguage } from "@wangeditor/editor";

const registerButton = (key, label, templateValue) => {
  Boot.registerMenu({
    key,
    factory() {
      return {
        key,
        tag: "button",
        title: label,
        getValue: () => "",
        isActive: () => false,
        isDisabled: () => false,
        exec(editor) {
          const value =
            typeof templateValue === "function"
              ? templateValue()
              : templateValue;

          if (editor?.insertText) {
            editor.insertText(value);
          } else {
            console.warn(
              "Cannot insert text – editor.insertText is undefined",
              editor
            );
          }
        },
      };
    },
  });
};

// Global guard for hot-reloading in development
if (!window.wangEditorCustomMenusRegistered) {
  console.log("Registering custom WangEditor menus...");

  const invoiceFields = [
    {
      key: "insert-invoice-number",
      label: "Invoice #",
      value: "{{invoiceNumber}}",
    },
    {
      key: "insert-invoice-date",
      label: "Invoice date",
      value: "{{invoiceDate}}",
    },
    { key: "insert-net-amount", label: "Netto (zł)", value: "{{netAmount}}" },
    { key: "insert-vat-amount", label: "VAT (zł)", value: "{{vatAmount}}" },
    {
      key: "insert-total-amount",
      label: "Brutto (zł)",
      value: "{{totalAmount}}",
    },
    { key: "insert-created-at", label: "Created at", value: "{{createdAt}}" },
  ];

  for (const { key, label, value } of invoiceFields) {
    registerButton(key, label, value);
  }

  window.wangEditorCustomMenusRegistered = true;
  console.log("Custom WangEditor menus registered.");
}

export default {
  components: { Editor, Toolbar },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const editorRef = shallowRef(null);
    const valueHtml = ref(props.modelValue);

    i18nChangeLanguage("en");

    watch(valueHtml, (newVal) => {
      emit("update:modelValue", newVal);
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue !== valueHtml.value) {
          valueHtml.value = newValue;
        }
      }
    );

    const toolbarConfig = {
      toolbarKeys: [
        "headerSelect",
        "bold",
        "italic",
        "underline",
        "bulletedList",
        "numberedList",
        "blockquote",
        "insertLink",
        "insertImage",
        "|",
        "insert-invoice-number",
        "insert-invoice-date",
        "insert-net-amount",
        "insert-vat-amount",
        "insert-total-amount",
        "insert-created-at",
        "|",
        "undo",
        "redo",
      ],
    };

    const editorConfig = {
      placeholder: "Type here...",
    };

    const handleCreated = (editor) => {
      editorRef.value = editor;
    };

    onBeforeUnmount(() => {
      if (editorRef.value) {
        editorRef.value.destroy();
        editorRef.value = null;
      }
    });

    return {
      editorRef,
      valueHtml,
      mode: "dark",
      toolbarConfig,
      editorConfig,
      handleCreated,
    };
  },
};
</script>
