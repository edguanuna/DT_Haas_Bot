'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import 'dotenv/config'

export default function Form() {
    const { register, handleSubmit } = useForm()
    const [message, setMessage] = useState("")

    // const backendUrl = "https://diversa-haas-bot.up.railway.app/"
    const backendUrl = 'http://localhost:5000/'

    const onSubmit = async (data) => {
        console.log(data)
        const response = await fetch(backendUrl, {
            method: 'POST',
            // mode: "no-cors",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            setMessage('Check your reservations to see if it worked! Lol');
          } else {
            setMessage(`Error: ${data.error}`);
          }
        console.log(response)
    };


    return (
        <div className="min-h-screen font-sans antialiased flex flex-col items-center justify-top bg-gradient-to-r from-orange-400 via-gray-500 to-white">
            <div className="text-center mt-6 mb-10">
                <h2 className="text-2xl font-bold mb-5">HaasBot</h2>
                <h1 className="text-4xl font-semibold">Welcome to DiversaTech's Haas Room Booker!</h1>
            </div>
            <div id="form" className="w-full max-w-xs">
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <InputMask mask="99/99/2023" defaultValue="08/14/2023" {...register("date")} placeholder="MM/DD/YYYY" className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
                    </div>
                    <div className="mb-6">
                        <select {...register("startTime")} className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                            <option value="10">10:00</option>
                            <option value="11">11:00</option>
                            <option value="12">12:00</option>
                            <option value="1">1:00</option>
                            <option value="2">2:00</option>
                            <option value="3">3:00</option>
                            <option value="4">4:00</option>
                            <option value="5">5:00</option>
                            <option value="6">6:00</option>
                            <option value="7">7:00</option>
                            <option value="8">8:00</option>
                            <option value="9">9:00</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <select {...register("timeOfDay")} className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <select {...register("duration")} className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                            <option value="sixty">60 min</option>
                            <option disabled value="thirty">30 min</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <select {...register("roomNumber")} className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                            <option value="341">N115</option>
                            <option value="342">N150</option>
                            <option value="326">N155</option>
                            <option value="343">N158</option>
                            <option value="345">N255</option>
                            <option value="346">N258</option>
                        </select>
                    </div>
                    <div className="mb-4">
                    <input {...register("eventName")} defaultValue={"Testing"} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Event Name: DiversaTech"/>
                    </div>
                    <div className="mb-4">  
                    {/* GET RID OF DEFAULT */}
                    <input {...register("phoneNumber")} defaultValue={process.env.DEFAULT_PHONE} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Phone Number: (can be fake)"/>
                    </div>
                    <div className="mb-4">
                    <input {...register("calNetId")} defaultValue={process.env.DEFAULT_USER} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Cal Net ID:"/>
                    </div>
                    <div className="mb-4">
                    <input type="password" {...register("password")} defaultValue={process.env.DEFAULT_PASS} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Password:"/>
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                            Book Room
                        </button>
                    </div>
                </form>
                <p className='justify-center items-center'>{ message }</p>
            </div>
        </div>
    );
}