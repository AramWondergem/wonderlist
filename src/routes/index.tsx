import {$, component$, QwikSubmitEvent, Signal, useSignal, useVisibleTask$} from "@builder.io/qwik";
import type {DocumentHead} from "@builder.io/qwik-city";
import {Input, Button} from '~/components/ui';
import {MoCircleAdd, MoDelete} from "@qwikest/icons/monoicons";

export default component$(() => {
    const boodschappen: Signal<string[]> = useSignal<string[]>([
        'Appels',
        'Melk',
        'Brood',
        'Eieren',
        'Kaas',
        'superlangwoordwatgebrokenmoetwordenishetzolanggenoeg',
        'friet met mayo en mosterd en azijn'
    ]);
    const newListItem: Signal<string> = useSignal<string>("");
    const ulRef = useSignal<HTMLInputElement>();
    const inputRef = useSignal<HTMLInputElement>();
    const isScrollToEndNeeded = useSignal(false);


    const addListItem = $((event: QwikSubmitEvent<HTMLFormElement>) => {
        if (newListItem.value !== "") {
            boodschappen.value = [...boodschappen.value, newListItem.value];
            newListItem.value = "";
        }
        console.log(event)

    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({track}) => {
        track(() => boodschappen.value.length);

        if (!isScrollToEndNeeded.value) {
            isScrollToEndNeeded.value = true;
            return;
        }

        const el = ulRef.value;
        if (el) {
            el.scrollTo({
                top: el.scrollHeight,
                behavior: 'smooth',
            });
        }
    });

    const deleteListItem = $((index: number) => {
        boodschappen.value = boodschappen.value.filter((_, i) => i !== index);
        isScrollToEndNeeded.value = false;
    })

    return (
        <div class="w-screen h-dvh bg-background flex flex-col items-stretch justify-between">
            <h1 class="flex-none bg-primary text-3xl font-bold text-white text-center px-2 py-2">Wonderlist</h1>
            <ul ref={ulRef}
                class="flex-1 flex flex-col items-center mx-2 overflow-y-scroll min-h-0 pt-2">
                {boodschappen.value.map((item, index) => (
                    <li
                        class="bg-secondary max-w-[600px] w-full flex justify-between items-center p-3 rounded text-white text-xl gap-2 mb-2"
                        key={item + index}
                    >
                        <span class="break-words flex-1 min-w-0">{item}</span>
                        <Button
                            size="sm"
                            class="text-xl"
                            onClick$={$(() => deleteListItem(index))}
                        >
                            <MoDelete/>
                        </Button>
                    </li>
                ))}
            </ul>
            <form preventdefault:submit={true} onSubmit$={addListItem}
                  class=" flex-none flex flex-row gap-2 px-2 py-2 max-w-[600px] self-center w-full bg-primary">
                <Input class="bg-foreground text-black flex-initial"
                       ref={inputRef}
                       type="text"
                       value={newListItem.value}
                       onInput$={(e) =>
                           (newListItem.value = (e.target as HTMLInputElement).value)
                       }
                       onBlur$={(e) => {
                           const related = e.relatedTarget as HTMLElement | null;

                           // Alleen herfocussen als gebruiker op de Button heeft geklikt
                           if (related?.tagName === 'BUTTON') {
                               (e.target as HTMLInputElement).focus();
                           }
                       }}

                />
                <Button id="add-item-button" type="submit" look="secondary" class="text-3xl bg-background text-white">
                    <MoCircleAdd/>
                </Button>
            </form>

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
