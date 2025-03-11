import { ref, watchEffect } from "vue";
import { toast } from "vue3-toastify";

export function useApi(resource) {
  const baseUrl = "http://localhost:4000";

  const data = ref([]);
  const pending = ref(true);
  const error = ref(null);

  const refresh = async () => {
    try {
      pending.value = true;
      const response = await $fetch(`${baseUrl}/${resource}`);
      data.value = [...response.map(({ type, ...rest }) => rest)];
      pending.value = false;
      console.log("Refreshed data:", data.value);
    } catch (err) {
      error.value = err;
      console.error(`Error fetching ${resource}:`, err);
      pending.value = false;
    }
  };

  watchEffect(() => {
    if (resource) {
      refresh();
    }
  });

  const deleteItem = async (id) => {
    try {
      await $fetch(`${baseUrl}/${resource}/${id}`, {
        method: "DELETE",
      });

      toast.success("Successfully deleted", { autoClose: 1000 });

      await refresh();
    } catch (err) {
      toast.error(`Error deleting ${resource}: ${err}`);
    }
  };

  const editItem = async (id, payload) => {
    try {
      await $fetch(`${baseUrl}/${resource}/${id}`, {
        method: "PATCH",
        body: payload,
      });

      toast.success("Successfully edited", { autoClose: 1000 });
      await refresh();
    } catch (error) {
      toast.error(`Error editing ${resource}: ${error}`);
    }
  };

  return { data, pending, error, refresh, deleteItem, editItem };
}
