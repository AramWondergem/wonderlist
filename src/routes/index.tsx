import {$, component$, sync$, useSignal, useVisibleTask$} from "@builder.io/qwik";
import {DocumentHead, Form, routeAction$, routeLoader$, z, zod$} from "@builder.io/qwik-city";
import {Button, Input} from '~/components/ui';
import {MoCircleAdd, MoDelete} from "@qwikest/icons/monoicons";
import {shoppingListItems} from "../../drizzle/schema";
import {eq} from "drizzle-orm";
import {getDb} from "../db/getDb";


export const useShoppingList = routeLoader$(async function () {
    const db = await getDb();
    return db.select().from(shoppingListItems).orderBy(shoppingListItems.order);
});

export const useCreateShoppingListItem = routeAction$(async function (data) {
    if(data.text) {
        const db = await getDb();
        await db.insert(shoppingListItems).values({text: data.text, order: data.order});
        return {success: true};
    }

    return {success:false};

}, zod$({text: z.string(), order: z.string().transform(val => parseFloat(val))}));

export const useDeleteShoppingListItem = routeAction$(async function (data) {
    const db = await getDb();
    await db.delete(shoppingListItems).where(eq(shoppingListItems.id, data.id));
    return {success: true};
}, zod$({id: z.number()}));

export const useUpdateShoppingListItemOrder = routeAction$(async function (data) {
    const db = await getDb();
    await db.update(shoppingListItems).set({order: data.order}).where(eq(shoppingListItems.id, data.id));
    return {success: true};
}, zod$({id: z.number(), order: z.number()}));


export default component$(() => {
    const items = useShoppingList();
    const createAction = useCreateShoppingListItem();
    const deleteAction = useDeleteShoppingListItem();
    const updateOrderAction = useUpdateShoppingListItemOrder();
    const ulRef = useSignal<HTMLInputElement>();
    const inputRef = useSignal<HTMLInputElement>();
    const isScrollToEndNeeded = useSignal(false);
    const lastOrderNumber = items.value.at(-1)?.order ?? 0;

    const onDragStart = sync$(
        (e: DragEvent, currentTarget: HTMLElement) => {
            const itemIndex = currentTarget.getAttribute('data-id');
            if (e.dataTransfer && itemIndex) {
                e.dataTransfer?.setData('text/plain', itemIndex);

                const dragImage = document.createElement('div');
                dragImage.textContent = currentTarget.firstChild?.textContent ?? '🛒';
                dragImage.style.fontSize = '1.25rem';
                dragImage.style.color = 'white';
                dragImage.style.position = 'absolute';
                dragImage.style.top = '-9999px';
                dragImage.style.background = 'transparent';


                document.body.appendChild(dragImage);

                // to center the text

                const height = dragImage.offsetHeight;
                const width = dragImage.offsetWidth;
                e.dataTransfer.setDragImage(dragImage,width + 40, (height / 2)); // Center the emoji

                // Remove the div after a brief moment
                requestAnimationFrame(() => {
                    if (dragImage.parentNode) {
                        document.body.removeChild(dragImage);
                    }
                });
            }
        }
    )

    const onDragEnter = sync$((_: DragEvent, currentTarget: HTMLElement) => {
        currentTarget.setAttribute('data-over', 'true');
    })

    const onDragLeave = sync$((e: DragEvent, currentTarget: HTMLElement) => {
        const relatedTarget = e.relatedTarget as Node;
        if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
            currentTarget.removeAttribute('data-over');
        }
    })

    const getIndexDropped = $((droppedIndexStr: undefined | string) => {
        if (droppedIndexStr === undefined) {
            throw new Error('droppedIndex data attribute is missing');
        }

        return parseInt(droppedIndexStr);
    })

    const onDropListElement = [
        sync$((e: DragEvent, currentTarget: HTMLElement) => {
            currentTarget.dataset.droppedIndex = e.dataTransfer?.getData('text');
            currentTarget.removeAttribute('data-over');

        }),
        $(async (_: DragEvent, currentTarget: HTMLElement) => {
            const targetIndexStr = currentTarget.getAttribute('data-id');

            if (targetIndexStr === null) {
                throw new Error('droppedIndex data attribute is missing');
            }

            const indexTarget = parseInt(targetIndexStr);
            const indexDropped = await getIndexDropped(currentTarget.dataset.droppedIndex);

            const droppedItem = items.value.at(indexDropped);

            if (!droppedItem) {
                throw new Error('droppedIndex does not exist in items array')
            }

            let newOrderDropped: number = -1;


            if (indexDropped === indexTarget ||  indexTarget < 0 || indexTarget >= items.value.length - 1) {
                return
            }

            if (indexTarget === 0) {
                newOrderDropped = (items.value.at(indexTarget)?.order ?? 1) / 2;
            } else if (indexTarget === items.value.length - 1) {
                newOrderDropped = lastOrderNumber + 1;
            } else {
                let before: number | undefined;
                let after: number | undefined;

                if(indexDropped < indexTarget) { // dragging down in list
                    before = items.value.at(indexTarget)?.order;
                    after  = items.value.at(indexTarget + 1)?.order;
                } else { // dragging up in list
                    before = items.value.at(indexTarget - 1)?.order;
                    after  = items.value.at(indexTarget)?.order;
                }

                if(before && after) {
                    newOrderDropped = (before + after) / 2;
                }

            }

            if(newOrderDropped >= 0 ){
                await updateOrderAction.submit({id: droppedItem.id, order: newOrderDropped});
            } else {
                console.error('something went wrong with reordering. New order number is not assigned properly.')
            }

        }),
    ]

    const onDropBelowList = [
        sync$((e: DragEvent, currentTarget: HTMLDivElement) => {
            currentTarget.dataset.droppedIndex = e.dataTransfer?.getData('text');
        }),
        $(async (_: DragEvent, currentTarget: HTMLElement) => {


            const indexDropped = await getIndexDropped(currentTarget.dataset.droppedIndex)

            const droppedItem = items.value.at(indexDropped);

            if (!droppedItem) {
                throw new Error('droppedIndex does not exist in items array')
            }

            if (indexDropped !== items.value.length - 1) {
                const newOrderDropped: number = lastOrderNumber + 1;
                await updateOrderAction.submit({id: droppedItem.id, order: newOrderDropped});
            }
        }),
    ]



    useVisibleTask$(({track}) => {
        track(() => items.value?.length);
        if (!isScrollToEndNeeded.value) {
            isScrollToEndNeeded.value = true;
            return;
        }
        const el = ulRef.value;
        if (el) {
            el.scrollTo({
                top: el.scrollHeight + 100,
                behavior: 'smooth',
            });
        }
    });

    return (
        <div class="w-screen h-dvh bg-background flex flex-col items-stretch justify-between">
            <h1 class="flex-none bg-primary text-3xl font-bold text-white flex justify-center items-center px-2 py-2 h-[64px]">Wonderlist</h1>
            <ul ref={ulRef}
                class="flex-1 flex flex-col items-center p-2 overflow-y-scroll h-full gap-2"

            >


                {items.value?.map((item,index) => (

                    <li
                        class="bg-secondary max-w-[600px] w-full flex justify-between items-center p-3 rounded text-white text-xl gap-2 [&[data-over]]:bg-primary"
                        key={item.id}
                        data-id={index}
                        draggable
                        onDragStart$={onDragStart}
                        preventdefault:dragover
                        preventdefault:drop
                        preventdefault:dragenter
                        onDragEnter$={onDragEnter}
                        onDragLeave$={onDragLeave}
                        onDrop$={onDropListElement}

                    >
                        <span class="break-words flex-1 min-w-0">{item.text}</span>
                        <Button
                            size="sm"
                            class="text-xl "
                            onClick$={async () => {
                                await deleteAction.submit({id: item.id});
                                isScrollToEndNeeded.value = false;
                            }}
                        >   <MoDelete />
                        </Button>
                    </li>
                ))}
                <div class="max-w-[600px] w-full h-full"
                     data-id={-1}
                     preventdefault:dragover
                     preventdefault:drop
                     onDrop$={onDropBelowList}
                ></div>
            </ul>
            <div class="flex flex-row justify-center bg-primary">
                <Form spaReset={true} action={createAction}
                      class=" flex-none flex flex-row gap-2 px-2 py-2 max-w-[600px] self-center w-full bg-primary">
                    <Input class="bg-foreground text-black flex-initial"
                           ref={inputRef}
                           type="text"
                           name="text"
                           onBlur$={(e) => {
                               const related = e.relatedTarget as HTMLElement | null;

                               // Alleen herfocussen als gebruiker op de Button heeft geklikt
                               if (related?.tagName === 'BUTTON') {
                                   (e.target as HTMLInputElement).focus();
                               }
                           }}
                    />
                    <input type="hidden" name="order" value={lastOrderNumber + 1}/>
                    <Button id="add-item-button" type="submit" look="secondary"
                            class="text-3xl bg-background text-white">
                        <MoCircleAdd/>
                    </Button>
                </Form>
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Wonderlist", // <-- Change this to your desired title
    meta: [
        {
            name: "description",
            content: "Wonderlist is a simple shopping list app that allows you to add and delete items from your list.",
        },
    ],
};
