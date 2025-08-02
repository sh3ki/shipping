<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Cell;

class Category extends Model
{
    protected $primaryKey = 'primary_id';
    protected $fillable = [
        'name',
        'description',
        'color',
        'direction',
    ];
    public function cells()
    {
        return $this->hasMany(Cell::class, 'category_id', 'primary_id');
    }
}
