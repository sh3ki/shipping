<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dimension extends Model
{
    protected $fillable = [
        'map_length',
        'map_width',
    ];
}
