import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMovie, updateMovie, getMovieById, uploadImage, type Movie, type MovieFormData } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Upload } from 'lucide-react';

export default function MovieForm() {
	const navigate = useNavigate();
	const { id } = useParams();
	const isEditMode = Boolean(id);

	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [formData, setFormData] = useState<MovieFormData>({
		title: '',
		genre: '',
		rating: undefined,
		posterImage: '',
	});

	const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary', 'Animation'];

	useEffect(() => {
		if (isEditMode && id) {
			loadMovie(id);
		}
	}, [id, isEditMode]);

	async function loadMovie(movieId: string) {
		try {
			setLoading(true);
			const movie = await getMovieById(movieId);
			setFormData({
				title: movie.title,
				genre: movie.genre || '',
				rating: movie.rating,
				posterImage: movie.posterImage || '',
			});
		} catch (error) {
			console.error('Failed to load movie:', error);
			alert('Failed to load movie');
		} finally {
			setLoading(false);
		}
	}

	async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploading(true);
			const result = await uploadImage(file);
			setFormData({ ...formData, posterImage: result.url });
		} catch (error) {
			console.error('Failed to upload image:', error);
			alert('Failed to upload image');
		} finally {
			setUploading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!formData.title.trim()) {
			alert('Title is required');
			return;
		}

		try {
			setLoading(true);
			if (isEditMode && id) {
				await updateMovie(id, formData);
			} else {
				await createMovie(formData);
			}
			navigate('/');
		} catch (error) {
			console.error('Failed to save movie:', error);
			alert('Failed to save movie');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
				<ArrowLeft className="mr-2 h-4 w-4" /> Back to Movies
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>{isEditMode ? 'Edit Movie' : 'Add New Movie'}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="title">
								Title <span className="text-red-500">*</span>
							</Label>
							<Input
								id="title"
								type="text"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								required
								placeholder="Enter movie title"
							/>
						</div>

						{/* Genre */}
						<div className="space-y-2">
							<Label htmlFor="genre">Genre (Optional)</Label>
							<Select value={formData.genre || ''} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
								<SelectTrigger>
									<SelectValue placeholder="Select a genre" />
								</SelectTrigger>
								<SelectContent>
									{genres.map((genre) => (
										<SelectItem key={genre} value={genre}>
											{genre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Rating */}
						<div className="space-y-2">
							<Label htmlFor="rating">Rating (1-5, Optional)</Label>
							<Select
								value={formData.rating?.toString() || ''}
								onValueChange={(value) => setFormData({ ...formData, rating: value ? parseInt(value) : undefined })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a rating" />
								</SelectTrigger>
								<SelectContent>
									{[1, 2, 3, 4, 5].map((rating) => (
										<SelectItem key={rating} value={rating.toString()}>
											{rating} Star{rating > 1 ? 's' : ''}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Poster Image */}
						<div className="space-y-2">
							<Label htmlFor="posterImage">Poster Image (Optional)</Label>
							<div className="flex gap-2">
								<Input
									id="posterImage"
									type="text"
									value={formData.posterImage || ''}
									onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
									placeholder="Enter image URL or upload"
								/>
								<div className="relative">
									<Button type="button" variant="outline" disabled={uploading} asChild>
										<label htmlFor="imageFile" className="cursor-pointer">
											<Upload className="mr-2 h-4 w-4" />
											{uploading ? 'Uploading...' : 'Upload'}
										</label>
									</Button>
									<input
										id="imageFile"
										type="file"
										accept="image/*"
										onChange={handleImageUpload}
										className="hidden"
										disabled={uploading}
									/>
								</div>
							</div>
							{formData.posterImage && (
								<img src={formData.posterImage} alt="Preview" className="mt-2 w-32 h-48 object-cover rounded" />
							)}
						</div>

						{/* Submit Buttons */}
						<div className="flex gap-2 pt-4">
							<Button type="submit" disabled={loading || uploading} className="flex-1">
								{loading ? 'Saving...' : isEditMode ? 'Update Movie' : 'Add Movie'}
							</Button>
							<Button type="button" variant="outline" onClick={() => navigate('/')}>
								Cancel
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
