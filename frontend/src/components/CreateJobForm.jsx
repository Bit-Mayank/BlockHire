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
            {({ setFieldValue }) => (
                <Form className="flex flex-col gap-5 p-6 max-w-full min-w-xl mx-auto bg-gray-900 rounded-xl shadow-lg">
                    {/* Title */}
                    <div className="flex flex-col">
                        <label className="text-lg font-semibold text-gray-300">Title</label>
                        <Field
                            name="title"
                            type="text"
                            className="mt-2 h-10 px-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter title"
                        />
                        <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Budget */}
                    <div className="flex flex-col">
                        <label className="text-lg font-semibold text-gray-300">Budget (in ETH)</label>
                        <Field
                            name="budget"
                            type="number"
                            className="mt-2 h-10 px-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter budget"
                        />
                        <ErrorMessage name="budget" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                        <label className="text-lg font-semibold text-gray-300">Description</label>
                        <Field
                            as="textarea"
                            name="description"
                            rows={4}
                            className="mt-2 px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Describe the job..."
                        />
                        <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-col">
                        <label className="text-lg font-semibold text-gray-300">Tech Stack</label>
                        <Field
                            name="stack"
                            type="text"
                            className="mt-2 h-10 px-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter tech stack"
                        />
                        <ErrorMessage name="stack" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Links */}
                    <div className="flex flex-col">
                        <label className="text-lg font-semibold text-gray-300">Links (Portfolio/GitHub/Docs)</label>
                        <Field
                            name="links"
                            type="url"
                            className="mt-2 h-10 px-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter relevant links"
                        />
                        <ErrorMessage name="links" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Image Upload */}
                    <div className="flex flex-col">
                        <label className="text-lg font-semibold text-gray-300">Image (Optional)</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFieldValue("image", e.currentTarget.files[0])}
                            className="mt-2 block w-full text-sm text-gray-300
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-purple-600 file:text-white
                            hover:file:bg-purple-700 cursor-pointer"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-purple-700 hover:bg-purple-800 transition-colors duration-300 rounded-md text-white font-semibold"
                        >
                            Create Job
                        </button>
                    </div>
                </Form>
            )}
        </Formik>

    );
};

export default CreateJobForm;
