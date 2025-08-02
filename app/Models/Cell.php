<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cell extends Model
{
    protected $primaryKey = 'primary_id';
    protected $fillable = [
        'cell_id',
        'status',
        'category_id',
        'name',
    ];
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'primary_id');
    }
}
