import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ChainContext } from "../context/ChainContextProvider";
import { parseEther } from "ethers";
import { uploadJobFolderToLighthouse } from "../utils/Lighthouse";

const CreateJobForm = ({ contract, signer }) => {


    const initialValues = {
        title: "",
        budget: "",
        description: "",
        stack: "",
        links: "",
        image: null,
    };

    const validationSchema = Yup.object({
        title: Yup.string().required("Required"),
        budget: Yup.number().positive().required("Required"),
        description: Yup.string().required("Required"),
        stack: Yup.string().required("Required"),
        links: Yup.string().url("Must be a valid URL").required("Required"),
        image: Yup.mixed().nullable().notRequired(),
    });


    const handleSubmit = async (values, { resetForm }) => {
        try {
            console.log("Clicked")
            const jobData = {
                title: values.title,
                description: values.description,
                techStack: values.stack,
                links: values.links,
            };

            const { metadataCID } = await uploadJobFolderToLighthouse(jobData, values.image);

            if (metadataCID) {
                const budget = parseEther(values.budget.toString());
                const tx = await contract.connect(signer).createJob(values.title, budget, metadataCID);
                await tx.wait();
                alert("Job created successfully!");
                resetForm();
            }
        } catch (err) {
            console.error(err);
            alert("Error creating job");
        }
    };

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ setFieldValue }) => {
                {/* console.log("Errors:", errors); */ }
                return (
                    <Form style={{ display: "flex", flexDirection: "column" }}>
                        <label className={` font-semibold text-lg`}>Title</label>
                        <Field
                            name="title"
                            type="text"
                            className={`border-2 border-black mb-4 mt-1.5 rounded-md px-2 h-8`}
                            placeholder="Please Enter Title"
                        />
                        <ErrorMessage name="title" component="div" style={{ color: "red" }} className={` relative -top-3`} />

                        <label className={` font-semibold text-lg`}>Budget (in ETH)</label>
                        <Field
                            name="budget"
                            type="number"
                            className={`border-2 border-black mb-4 mt-1.5 rounded-md px-2 h-8`}
                            placeholder="Please Enter Budget"
                        />
                        <ErrorMessage name="budget" component="div" style={{ color: "red" }} className={` relative -top-3`} />

                        <label className={` font-semibold text-lg`}>Description</label>
                        <Field
                            as="textarea"
                            name="description"
                            className={`border-2 border-black mb-4 mt-1.5 rounded-md px-2`}
                            placeholder="Please Enter Description"
                        />
                        <ErrorMessage name="description" component="div" style={{ color: "red" }} className={` relative -top-3`} />

                        <label className={` font-semibold text-lg`}>Tech Stack</label>
                        <Field
                            name="stack"
                            type="text"
                            className={`border-2 border-black mb-4 mt-1.5 rounded-md px-2 h-8`}
                            placeholder="Please Enter Tech Stack"
                        />
                        <ErrorMessage name="stack" component="div" style={{ color: "red" }} className={` relative -top-3`} />

                        <label className={` font-semibold text-lg`}>Links (portfolio/github/docs)</label>
                        <Field
                            name="links"
                            type="url"
                            className={`border-2 border-black mb-4 mt-1.5 rounded-md px-2 h-8`}
                            placeholder="Please Enter Necessary Links"
                        />
                        <ErrorMessage name="links" component="div" style={{ color: "red" }} className={` relative -top-3`} />

                        <label className={` font-semibold text-lg`}>{`Image (Optional)`}</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFieldValue("image", e.currentTarget.files[0])}
                            className={`border-2 border-black mb-4 mt-1.5 rounded-md file:bg-amber-400 file:border-0 file:p-2 file:rounded-sm cursor-pointer file:cursor-pointer file:font-semibold`}
                        />

                        <div className={` flex justify-center`}>
                            <button type="submit" className={` border-0 bg-purple-700 text-white w-fit p-2 rounded-md cursor-pointer`}>Create Job</button>
                        </div>
                    </Form>
                )
            }}
        </Formik>
    );
};

export default CreateJobForm;
