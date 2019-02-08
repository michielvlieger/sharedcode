<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Rent;

class RentController extends Controller
{
    //function for getting all rents and converting for full calendar
    public function index()
    {
        //get all Rents ordered by created_at in descending order
        $allRents = Rent::orderBy('created_at', 'desc')->get();

        $allEvents = [];
        //loop through all rents to convert them to events for full calendar
        foreach ($allRents as $rent) {
            $color = null;
            //check the status of the rent for coloring in full calendar
            switch ($rent->status) {
                case 0:
                    $color = 'light-blue';
                    break;
                case 1:
                    $color = 'green';
                    break;
                case 2:
                    $color = 'red';
            }
            //push event to allEvent array
            array_push($allEvents, ['title' => $rent->userName, 'start' => $rent->startDate, 'end' => $rent->endDate, 'url' => "/rent/{$rent->id}", 'color' => $color]);
        }
        //return allRents and allEvents
        return response()->Json([
            'allRents' => $allRents,
            'allEvents' => $allEvents
        ]);
    }

    //function for storing a new rent
    public function store(Request $request)
    {
        //validating the request data using laravel validation
        $validatedData = $request->validate([
            'userName' => 'required|string',
            'startDate' => 'required|date',
            'endDate' => 'required|date',
            'userEmail' => 'required|string',
        ]);
        //saving the validated data in the database if the validation didn't fail
        $newRent = Rent::create([
            'userName' => $validatedData['userName'],
            'startDate' => $validatedData['startDate'],
            'endDate' => $validatedData['endDate'],
            'userEmail' => $validatedData['userEmail'],
            'status' => 0,
        ]);
        //return the new Rent
        return response()->Json($newRent);
    }

    //function for getting one rent by id
    public function show($id)
    {
        //find rent by id in database
        $rent = Rent::find($id);
        //converting rent to event
        $event = $this->convertToEvent($rent);
        //return rent and event
        return response()->Json(['rent' => $rent, 'event' => $event]);
    }

    //function for updating the status of a rent
    public function updateStatus(Request $request, $id)
    {
        //find rent by id in database
        $rent = Rent::find($id);
        //change the status to newStatus
        $rent->status = $request->input("newStatus");
        //save the change in the database
        $rent->save();
        //converting rent to event
        $event = $this->convertToEvent($rent);
        //returning rent and event
        return response()->Json(['rent' => $rent, 'event' => $event]);
    }

    //function for deleting a rent
    public function destroy($id)
    {
        //find rent by id
        $rent = Rent::find($id);
        //delete rent from database
        $rent->delete();
        //return conformation string
        return response()->json('rent succesfully deleted');
    }

    //function for converting rents to events
    public function convertToEvent($rent){
        //returning converted rent as event
        return $event = ['title' => $rent->userName, 'start' => $rent->startRent, 'end' => $rent->endRent];
    }
}
