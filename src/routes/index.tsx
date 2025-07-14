import {component$, useSignal, useVisibleTask$,} from "@builder.io/qwik";
import {DocumentHead, Form, routeAction$, routeLoader$, server$, z, zod$,} from "@builder.io/qwik-city";
import {Button, Input} from "~/components/ui";
import {MoCircleAdd, MoDelete} from "@qwikest/icons/monoicons";
import Database from "better-sqlite3";
import {drizzle} from "drizzle-orm/better-sqlite3";
import {schema} from "../../drizzle/schema";
import {eq} from "drizzle-orm";

const getDatabase = server$(function () {
  const sqlite = new Database("./drizzle/db/db.sqlite");
  return drizzle(sqlite, {schema});
})

export const useAddItem = routeAction$(
    async (data) => {
      const db = await getDatabase();
      return db.insert(schema.shoppingItems).values(data);
    },
    zod$({
      listItem: z.string(),
    }))

export const useGetShoppingItems = routeLoader$(async () => {
    try{
        const db = await getDatabase();
        return await db.select().from(schema.shoppingItems);
    } catch (error) {
        console.error(error);
    }
})

export const useDeleteItem = routeAction$(
    async (data) => {
        const db = await getDatabase();
        await db.delete(schema.shoppingItems).where(eq(schema.shoppingItems.id, data.id))
    },
    zod$({
        id: z.number(),
    }))


export default component$(() => {
  const boodschappen = useGetShoppingItems();
  const addItem = useAddItem();
  const deleteListItem = useDeleteItem();

  const ulRef = useSignal<HTMLInputElement>();
  const isScrollToEndNeeded = useSignal(false);


  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => boodschappen.value?.length);

    if (!isScrollToEndNeeded.value) {
      isScrollToEndNeeded.value = true;
      return;
    }

    const el = ulRef.value;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight + 100,
        behavior: "smooth",
      });
    }
  });


  return (
    <div class="flex h-dvh w-screen flex-col items-stretch justify-between bg-background">
      <h1 class="flex h-[64px] flex-none items-center justify-center bg-primary px-2 py-2 text-3xl font-bold text-white">
        Wonderlist
      </h1>
      <ul
        ref={ulRef}
        class="mx-2 flex min-h-0 flex-1 flex-col items-center overflow-y-scroll pt-2"
      >
        { boodschappen.value?.map((item) => (
          <li
            class="mb-2 flex w-full max-w-[600px] items-center justify-between gap-2 rounded bg-secondary p-3 text-xl text-white"
            key={item.id}
          >
            <span class="min-w-0 flex-1 break-words">{item.listItem}</span>
            <Button
              size="sm"
              class="text-xl"
              onClick$={async () => {
                  await deleteListItem.submit({id: item.id});
                  isScrollToEndNeeded.value = false;
              }}
            >
              <MoDelete />
            </Button>
          </li>
        ))}
      </ul>
      <div class="flex flex-row justify-center bg-primary">
        <Form
          spaReset={true}
          action={addItem}
          class="flex w-full max-w-[600px] flex-none flex-row gap-2 self-center bg-primary px-2 py-2"
        >
          <Input
            class="flex-initial bg-foreground text-black"
            type="text"
            name="listItem"
            onBlur$={(e) => {
              const related = e.relatedTarget as HTMLElement | null;

              // Alleen herfocussen als gebruiker op de Button heeft geklikt
              if (related?.tagName === "BUTTON") {
                (e.target as HTMLInputElement).focus();
              }
            }}
          />
          <Button
            id="add-item-button"
            type="submit"
            look="secondary"
            class="bg-background text-3xl text-white"
          >
            <MoCircleAdd />
          </Button>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
