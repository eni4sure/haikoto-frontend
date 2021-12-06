import React from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import CreatableSelect from "react-select/creatable";

import { cardService } from "../../app/services";
import { createCardUploadGreyImage } from "../../app/assets";
import { currentUser, withAuth, uploadImage } from "../../app/utils";
import { CardCancelButton, AlertComponent } from "../../app/components";

function createCard() {
    const user = currentUser().userData;
    const router = useRouter();

    const [previewImage, setPreviewImage] = React.useState(null);
    const [cardsAsHashtags, setCardsAsHashtags] = React.useState([]);
    const [alertState, setAlertState] = React.useState({
        show: false,
        message: "",
        type: ""
    });
    const [formInput, setFormInput] = React.useState({
        image: "",
        title: "",
        hashtags: ""
    });

    async function processCreateCard(e) {
        e.preventDefault();
        window.scrollTo(0, 0);

        // Set alert state to default
        setAlertState({ show: false, message: "", type: "" });

        // Extract formData from formInput state
        const { image, title, hashtags } = formInput;

        if (!image) {
            setAlertState({
                show: true,
                message: "Please upload a card image",
                type: "error"
            });
            return;
        }
        if (!title) {
            setAlertState({
                show: true,
                message: "Please enter a title",
                type: "error"
            });
            return;
        }
        if (!hashtags) {
            setAlertState({
                show: true,
                message: "Please enter hashtags",
                type: "error"
            });
            return;
        }

        // Create card
        const createCard = await cardService.create(formInput);

        // Handle response
        if (createCard.success) {
            setAlertState({
                show: true,
                message: createCard.message,
                type: "success"
            });

            // Redirect to the user page
            setTimeout(() => {
                router.push("/user");
            }, 2000);
        } else {
            setAlertState({
                show: true,
                message: createCard.message,
                type: "error"
            });
        }
    }

    React.useEffect(async () => {
        // Get pre existing card hashtags from DB
        const getAllCardsAsHashtag = await cardService.getAllCardsAsHashtag();
        if (getAllCardsAsHashtag.success) {
            setCardsAsHashtags(getAllCardsAsHashtag.data);
        }
    }, []);

    return (
        <>
            <Head>
                <title>Create Card - Haikoto</title>
            </Head>

            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="m-7 md:mx-44">
                    <div className="mb-2">
                        <h1 className="text-center text-xl md:text-3xl">
                            Create a Card
                        </h1>
                    </div>
                    {alertState.show && <AlertComponent {...alertState} />}
                    <div className="mt-2 p-4 md:py-16 max-w-lg">
                        <form onSubmit={processCreateCard}>
                            <label htmlFor="upload-button">
                                <div className="flex justify-center relative">
                                    <Image
                                        src={
                                            previewImage ||
                                            createCardUploadGreyImage
                                        }
                                        width={500}
                                        height={500}
                                    />
                                    {!previewImage && (
                                        <div className="absolute w-full py-2.5 bottom-1/3 bg-blue-600 text-white text-xs text-center leading-4">
                                            Click here upload
                                        </div>
                                    )}
                                </div>
                            </label>
                            <input
                                type="file"
                                id="upload-button"
                                style={{ display: "none" }}
                                onChange={async (e) => {
                                    // Set the Preview Image
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        setPreviewImage(e.target.result);
                                    };
                                    reader.readAsDataURL(file);

                                    const image = await uploadImage(file);
                                    if (image.success) {
                                        // Set the Form Input State
                                        setFormInput({
                                            ...formInput,
                                            image: image.url
                                        });
                                    } else {
                                        window.scrollTo(0, 0);
                                        setAlertState({
                                            show: true,
                                            message:
                                                "Image Upload Failed. Please try again.",
                                            type: "error"
                                        });
                                        setPreviewImage(null);
                                    }
                                }}
                            />

                            <div className="mt-4 mb-8">
                                <h1 className="md:text-3xl text-center">
                                    Choose an Image
                                </h1>
                                <h1 className="font-bold text-xl md:text-3xl text-center mt-4 md:mt-10">
                                    Title
                                </h1>
                                <input
                                    className="border-black border-2 my-2 w-full p-2"
                                    type="text"
                                    onChange={(e) => {
                                        setFormInput({
                                            ...formInput,
                                            title: e.target.value
                                        });
                                    }}
                                />
                                <h1 className="font-bold text-xl md:text-3xl text-center mt-4 md:mt-10">
                                    Hashtags (Parent Cards)
                                </h1>
                                <CreatableSelect
                                    className="border-black border-2 my-2 w-full"
                                    isMulti
                                    onChange={(e) => {
                                        setFormInput({
                                            ...formInput,
                                            hashtags: e.map((e) =>
                                                e.value.toLowerCase().trim()
                                            )
                                        });
                                    }}
                                    options={cardsAsHashtags.map((hashtag) => {
                                        return {
                                            value: hashtag.title,
                                            label: hashtag.title
                                        };
                                    })}
                                />
                                {/* Submit Button */}
                                <div className="flex justify-center mt-8">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        type="submit"
                                    >
                                        Publish
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <CardCancelButton />
                </div>
            </div>
        </>
    );
}

export default withAuth(createCard);
