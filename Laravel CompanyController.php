<?php

namespace App\Http\Controllers;

use App\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    //function for get request all companies with filters
    public function index(Request $request)
    {
        //Getting all inputs
        $paginationamount = $request->input('paginationamount');
        $namesearch = $request->input('name');
        $legalformsearch = $request->input('legal_form_id');
        $progressionsearch = $request->input('progression_id');
        $prioritysearch = $request->input('company_priority');
        $regionsearch = $request->input('region');
        $citysearch = $request->input('city');
        $edatesearch = $request->input('establishment_date');
        $orderby = $request->input('orderby');
        $orderway = $request->input('orderway');

        //check if paginationamount is set if not paginationamount becomes a default value
        if (!isset($paginationamount)) {
            $paginationamount = 25;
        }

        //db request company ordered by variable and if a search query is set: where with search query done
        $companies = Company::orderBy($orderby, $orderway)->where('visible','=',1)
            ->when(isset($namesearch), function ($q) use ($namesearch) {
                return $q->where('name', 'LIKE', '%' . $namesearch . '%');
            })
            ->when(isset($regionsearch), function ($q) use ($regionsearch) {
                return $q->where('region', 'LIKE', '%' . $regionsearch . '%');
            })
            ->when(isset($citysearch), function ($q) use ($citysearch) {
                return $q->where('city', 'LIKE', '%' . $citysearch . '%');
            })
            ->when(isset($legalformsearch), function ($q) use ($legalformsearch) {
                return $q->where('legal_form_id', $legalformsearch);
            })
            ->when(isset($progressionsearch), function ($q) use ($progressionsearch) {
                return $q->where('progression_id', $progressionsearch);
            })
            ->when(isset($prioritysearch), function ($q) use ($prioritysearch) {
                return $q->where('company_priority', $prioritysearch);
            })
            ->when(isset($edatesearch), function ($q) use ($edatesearch) {
                return $q->where('establishment_date', $edatesearch);
            })->paginate($paginationamount);

        //foreach company get the legal form and progression
        foreach ($companies as $company) {
            $company->legalForm;
            $company->progression;
        }
        //return the companies
        return response()->json([
            'allcompanies' => $companies
        ]);
    }

    //validate the company and store it in db
    public function store(Request $request)
    {
        //validate the request data
        $company = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'string|nullable',
            'region' => 'string|nullable',
            'kvk_number' => 'string|nullable|digits:8',
            'establishment_date' => 'date|nullable',
            'legal_form_id' => 'numeric|nullable',
            'status_id' => 'numeric|nullable',
            'sbi_code_id' => 'numeric|nullable'
        ]);

        //create the company using laravel eloquent automatically saved in database
        $newcompany = Company::create([
            'name' => $company['name'],
            'city' => $company['city'],
            'region' => $company['region'],
            'kvk_number' => $company['kvk_number'],
            'establishment_date' => $company['establishment_date'],
            'legal_form_id' => $company['legal_form_id'],
            'status_id' => $company['status_id'],
            'sbi_code_id' => $company['sbi_code_id'],
            'manually_added'=> 1,
        ]);

        //return string with status code 201
        return response(['Message' => 'Company toegevoegd aan de database',
                'statusCode' => 201]
            , 201);
    }

    //function getting company by id
    public function show($id)
    {
        //find company by id
        $company = Company::find($id);
        //getting legal form, status, sbi code and progression of company
        $company->legalForm;
        $company->status;
        if ($company->sbi_code) {
            $company->sbi_code->group;
        }
        $company->progression;
        $company->comments;
        foreach ($company->comments as $comment) {
            $comment->user;
        }
        //return the company
        return $company;
    }

    //function to change the priority of a company
    public function changepriority($id)
    {
        //find company by id
        $company = Company::find($id);
        //set the company priority to the opposite of what it was
        $company->company_priority = !$company->company_priority;
        //save the change in the database
        $company->save();
        //return string for conformation
        return "changed to $company->company_priority";
    }

    //function for updating a company in the database
    public function update(Request $request, $id)
    {
        //validate the request data
        $validatedcompany = $request->validate([
            'name' => 'required|string|max:255',
            'progression_id' => 'required|numeric',
            'city' => 'string|nullable',
            'region' => 'string|nullable',
            'status_id' => 'numeric|nullable'
        ]);
        //find company by id
        $company = Company::find($id);
        //getting all request data and setting it
        $company->name = $validatedcompany['name'];
        $company->region = $validatedcompany['region'];
        $company->city = $validatedcompany['city'];
        $company->status_id = $validatedcompany['status_id'];
        $company->progression_id = $validatedcompany['progression_id'];
        //save the company
        $company->save();
        //return string for conformation
        return response()->json('Company Updated Successfully.');
    }

    //function to delete company
    public function delete($id)
    {
        //find company by id
        $company = Company::find($id);
        //make company not show on pages
        $company->update([
            'visible'=>0
        ]);
        //return string for conformation
        return response()->json('company succesfully deleted');
    }
}
